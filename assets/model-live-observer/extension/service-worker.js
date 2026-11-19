"use strict";

importScripts("observer-config.js", "observer-policy.js");

const policy = globalThis.ModelLiveObserverPolicy;
const networkPolicy = policy.CONFIG.developmentNetworkCapture;
const SESSION_KEY = "activeModelObserverSession";
const LAST_ERROR_KEY = "lastModelObserverError";
const RESUME_RETRY_DELAYS_MS = [0, 150, 400, 900];
const BRIDGE_REQUEST_TIMEOUT_MS = 10000;
let evidenceQueue = Promise.resolve();
let lifecycleQueue = Promise.resolve();

const storageReady = chrome.storage.session.setAccessLevel({ accessLevel: "TRUSTED_CONTEXTS" });

class BridgeRequestError extends Error {
  constructor(code, authenticated = false) {
    super(code);
    this.name = "BridgeRequestError";
    this.code = code;
    this.authenticated = authenticated;
  }
}

async function getSession() {
  await storageReady;
  const stored = await chrome.storage.session.get(SESSION_KEY);
  return stored[SESSION_KEY] || null;
}

async function setSession(session) {
  await storageReady;
  await chrome.storage.session.set({ [SESSION_KEY]: session });
}

async function updateSession(sessionId, update) {
  const current = await getSession();
  if (!current || current.sessionId !== sessionId) {
    return null;
  }
  const next = { ...current, ...update };
  await setSession(next);
  return next;
}

async function clearSession() {
  await storageReady;
  await chrome.storage.session.remove(SESSION_KEY);
}

async function getLastError() {
  await storageReady;
  const stored = await chrome.storage.session.get(LAST_ERROR_KEY);
  return stored[LAST_ERROR_KEY] || null;
}

async function setLastError(code) {
  await storageReady;
  await chrome.storage.session.set({ [LAST_ERROR_KEY]: code });
}

async function clearLastError() {
  await storageReady;
  await chrome.storage.session.remove(LAST_ERROR_KEY);
}

async function setBadge(tabId, text, color) {
  await chrome.action.setBadgeBackgroundColor({ tabId, color });
  await chrome.action.setBadgeText({ tabId, text });
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0] || null;
}

function bridgeBaseUrl() {
  return `http://127.0.0.1:${policy.CONFIG.bridgePort}`;
}

function bridgeUrl(session) {
  return `${bridgeBaseUrl()}/v1/ingest`;
}

async function connectBridge(session) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), BRIDGE_REQUEST_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(`${bridgeBaseUrl()}/v1/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schemaVersion: policy.PROTOCOL_VERSION,
        contractVersion: policy.CONTRACT_VERSION,
        extensionVersion: chrome.runtime.getManifest().version
      }),
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
      referrerPolicy: "no-referrer",
      signal: controller.signal
    });
  } catch (_error) {
    throw new BridgeRequestError("BRIDGE_UNAVAILABLE");
  } finally {
    clearTimeout(timeout);
  }
  let payload;
  try {
    payload = await response.json();
  } catch (_error) {
    throw new BridgeRequestError("BRIDGE_INVALID_RESPONSE");
  }
  if (!response.ok || payload?.ok !== true) {
    throw new BridgeRequestError(payload?.code || `BRIDGE_HTTP_${response.status}`);
  }
  if (payload.schemaVersion !== policy.PROTOCOL_VERSION ||
      payload.contractVersion !== policy.CONTRACT_VERSION ||
      typeof payload.connectionSecret !== "string" ||
      !/^[a-zA-Z0-9_-]{40,128}$/.test(payload.connectionSecret)) {
    throw new BridgeRequestError("BRIDGE_INVALID_RESPONSE");
  }
  const connected = await updateSession(session.sessionId, {
    bridgeToken: payload.connectionSecret,
    bridgeConnected: true
  });
  if (!connected) {
    throw new BridgeRequestError("SESSION_STATE_LOST");
  }
  return connected;
}

async function postEnvelope(session, envelope) {
  const requestAuth = await hmacSha256(session.bridgeToken, policy.canonicalStringify(envelope));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), BRIDGE_REQUEST_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(bridgeUrl(session), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Model-Observer-Auth": requestAuth,
        "X-Model-Observer-Protocol": String(policy.PROTOCOL_VERSION),
      },
      body: JSON.stringify(envelope),
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
      referrerPolicy: "no-referrer",
      signal: controller.signal
    });
  } catch (_error) {
    throw new BridgeRequestError("BRIDGE_UNAVAILABLE");
  } finally {
    clearTimeout(timeout);
  }
  let payload = null;
  try {
    payload = await response.json();
  } catch (_error) {
    throw new BridgeRequestError("BRIDGE_INVALID_RESPONSE");
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new BridgeRequestError("BRIDGE_INVALID_RESPONSE");
  }
  const { responseAuth, ...responseCore } = payload;
  if (typeof responseAuth !== "string" || !/^[a-f0-9]{64}$/.test(responseAuth) ||
      await hmacSha256(session.bridgeToken, policy.canonicalStringify(responseCore)) !== responseAuth) {
    throw new BridgeRequestError("BRIDGE_ACK_AUTH_MISMATCH");
  }
  if (!response.ok || payload.ok !== true) {
    throw new BridgeRequestError(payload.code || `BRIDGE_HTTP_${response.status}`, true);
  }
  return payload;
}

function startPayload(session) {
  return {
    startedAt: session.startedAt,
    startUrl: session.startUrl,
    tabId: session.tabId,
    windowId: session.windowId,
    extensionVersion: chrome.runtime.getManifest().version,
    networkCapture: {
      enabled: networkPolicy.enabled,
      graphqlEndpointPaths: [...networkPolicy.graphqlEndpointPaths],
      maximumPendingRequests: networkPolicy.maximumPendingRequests,
      maximumRequestBodyBytes: networkPolicy.maximumRequestBodyBytes,
      maximumResponseBodyBytes: networkPolicy.maximumResponseBodyBytes,
      maximumSessionBodyBytes: networkPolicy.maximumSessionBodyBytes
    }
  };
}

function stopPayload(complete, reason) {
  return {
    stoppedAt: new Date().toISOString(),
    complete,
    reason
  };
}

async function buildEnvelope(session, eventType, payload) {
  const payloadHash = await sha256(policy.canonicalStringify(payload));
  const core = {
    schemaVersion: policy.PROTOCOL_VERSION,
    contractVersion: policy.CONTRACT_VERSION,
    sessionId: session.sessionId,
    seq: session.nextSequence,
    eventId: crypto.randomUUID(),
    observedAt: new Date().toISOString(),
    eventType,
    payloadHash,
    previousEventHash: session.lastAckHash
  };
  return { ...core, payload, eventHash: await sha256(policy.canonicalStringify(core)) };
}

function acknowledgedSessionUpdate(session, envelope, acknowledgment) {
  const update = {
    nextSequence: envelope.seq + 1,
    lastAckHash: envelope.eventHash,
    pendingEvent: null,
    lastError: null,
    lastBridgeStatus: acknowledgment.status,
    lastBridgeCaptureComplete: acknowledgment.captureComplete,
    lastBridgeComplete: acknowledgment.bridgeComplete,
    lastBridgeTransportReady: acknowledgment.transportReady
  };
  if (envelope.eventType === "observation") {
    const observation = envelope.payload.observation;
    update.observationCount = session.observationCount + 1;
    update.lastObservationAt = observation.observedAt;
    update.lastObservationKind = observation.kind;
    update.lastObservationId = observation.observationId;
    if (observation.kind === "snapshot") {
      update.lastSnapshotSignature = `${observation.url}\n${observation.sha256}`;
    }
  } else if (envelope.eventType.startsWith("network.graphql.")) {
    const network = envelope.payload.network;
    update.networkEventCount = session.networkEventCount + 1;
    update.lastNetworkAt = network.observedAt;
    update.lastNetworkKind = network.kind;
    if (network.body) {
      update.networkBodyBytes = session.networkBodyBytes + (network.body.complete ? network.body.byteLength : 0);
      if (!network.body.complete) {
        update.incompleteNetworkEvents = session.incompleteNetworkEvents + 1;
      }
    } else if (network.kind === "graphql-failure") {
      update.incompleteNetworkEvents = session.incompleteNetworkEvents + 1;
    }
  }
  return update;
}

async function transmitPending(session) {
  if (!session.pendingEvent) {
    return session;
  }
  let acknowledgment;
  try {
    acknowledgment = await postEnvelope(session, session.pendingEvent);
  } catch (error) {
    if (error?.authenticated === true &&
        error.code === "BRIDGE_EVENT_LIMIT_REACHED" &&
        !["session.started", "session.stopped", "session.aborted"].includes(session.pendingEvent.eventType)) {
      await updateSession(session.sessionId, { pendingEvent: null });
    }
    throw error;
  }
  if (acknowledgment.sequence !== session.pendingEvent.seq ||
      acknowledgment.eventHash !== session.pendingEvent.eventHash) {
    throw new BridgeRequestError("BRIDGE_ACK_MISMATCH");
  }
  const updated = await updateSession(
    session.sessionId,
    acknowledgedSessionUpdate(session, session.pendingEvent, acknowledgment)
  );
  if (!updated) {
    throw new BridgeRequestError("SESSION_STATE_LOST");
  }
  return updated;
}

async function sendSequencedEvent(session, eventType, payload) {
  let current = await getSession();
  if (!current || current.sessionId !== session.sessionId) {
    throw new BridgeRequestError("SESSION_STATE_LOST");
  }
  current = await transmitPending(current);
  const envelope = await buildEnvelope(current, eventType, payload);
  current = await updateSession(current.sessionId, { pendingEvent: envelope });
  if (!current) {
    throw new BridgeRequestError("SESSION_STATE_LOST");
  }
  return transmitPending(current);
}

async function bestEffortBridgeStop(session, reason) {
  try {
    await sendSequencedEvent(session, "session.aborted", stopPayload(false, reason));
    return true;
  } catch (_error) {
    return false;
  }
}

async function abortSession(reason) {
  let session = await getSession();
  if (!session) {
    await setLastError(reason);
    return { ok: true, aborted: false, reason };
  }
  session = await updateSession(session.sessionId, { stopping: true }) || session;
  try {
    await chrome.tabs.sendMessage(session.tabId, { type: "abort-content" });
  } catch (_error) {
    // Navigation or a closed tab may already have removed the content script.
  }
  await detachNetworkDebugger(session);
  await bestEffortBridgeStop(await getSession() || session, reason);
  await clearSession();
  await setLastError(reason);
  try {
    await setBadge(session.tabId, "ERR", "#cf222e");
  } catch (_error) {
    // The tab may no longer exist.
  }
  return { ok: true, aborted: true, reason };
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function queueEvidence(operation) {
  const queued = evidenceQueue.then(operation);
  evidenceQueue = queued.catch(() => undefined);
  return queued;
}

function filteredHeaders(rawHeaders) {
  const headers = {};
  for (const [rawName, rawValue] of Object.entries(rawHeaders || {})) {
    const name = String(rawName);
    if (["cookie", "set-cookie"].includes(name.toLowerCase())) {
      continue;
    }
    headers[name] = typeof rawValue === "string" ? rawValue : String(rawValue);
  }
  if (!policy.validateNetworkHeaders(headers)) {
    throw new BridgeRequestError("NETWORK_HEADERS_LIMIT_EXCEEDED");
  }
  return headers;
}

function matchedGraphqlUrl(session, rawUrl) {
  if (!networkPolicy.enabled || !policy.validNetworkUrl(rawUrl)) {
    return null;
  }
  const parsed = new URL(rawUrl);
  if (parsed.origin !== session.origin) {
    return null;
  }
  return {
    endpoint: `${parsed.origin}${parsed.pathname}`,
    url: rawUrl
  };
}

function extractOperationNames(body) {
  if (typeof body !== "string" || body.length === 0) {
    return [];
  }
  let operations;
  try {
    const parsed = JSON.parse(body);
    operations = Array.isArray(parsed) ? parsed : [parsed];
  } catch (_error) {
    operations = [{ query: body }];
  }
  return operations.slice(0, 64).map((operation) => {
    if (operation && typeof operation === "object" && !Array.isArray(operation) &&
        typeof operation.operationName === "string" && /^[_A-Za-z][_0-9A-Za-z]{0,255}$/.test(operation.operationName)) {
      return operation.operationName;
    }
    const query = operation && typeof operation === "object" && !Array.isArray(operation)
      ? operation.query
      : null;
    const match = typeof query === "string"
      ? /(?:^|\s)(?:query|mutation|subscription)\s+([_A-Za-z][_0-9A-Za-z]{0,255})\b/.exec(query)
      : null;
    return match ? match[1] : null;
  });
}

async function bodyEvidence(body, base64Encoded, maximumBytes, session) {
  if (typeof body !== "string") {
    return {
      base64Encoded: Boolean(base64Encoded),
      body: null,
      byteLength: 0,
      complete: false,
      omissionReason: "BODY_UNAVAILABLE",
      sha256: null
    };
  }
  const byteLength = new TextEncoder().encode(body).byteLength;
  const omissionReason = byteLength > maximumBytes
    ? "BODY_LIMIT_EXCEEDED"
    : session.networkBodyBytes + byteLength > networkPolicy.maximumSessionBodyBytes
      ? "SESSION_BODY_LIMIT_EXCEEDED"
      : null;
  if (omissionReason) {
    return {
      base64Encoded: Boolean(base64Encoded),
      body: null,
      byteLength,
      complete: false,
      omissionReason,
      sha256: null
    };
  }
  return {
    base64Encoded: Boolean(base64Encoded),
    body,
    byteLength,
    complete: true,
    omissionReason: null,
    sha256: await sha256(body)
  };
}

function cdpBodyErrorEvidence(reason = "CDP_BODY_ERROR") {
  return {
    base64Encoded: false,
    body: null,
    byteLength: 0,
    complete: false,
    omissionReason: reason,
    sha256: null
  };
}

async function setPendingNetworkRequest(sessionId, pending) {
  const current = await getSession();
  if (!current || current.sessionId !== sessionId || current.stopping) {
    return null;
  }
  const others = (current.pendingNetworkRequests || []).filter((item) => item.requestId !== pending.requestId);
  if (others.length >= networkPolicy.maximumPendingRequests) {
    throw new BridgeRequestError("NETWORK_PENDING_LIMIT_EXCEEDED");
  }
  return updateSession(sessionId, { pendingNetworkRequests: [...others, pending] });
}

async function updatePendingNetworkResponse(sessionId, requestId, response) {
  const current = await getSession();
  if (!current || current.sessionId !== sessionId || current.stopping) {
    return null;
  }
  const pending = (current.pendingNetworkRequests || []).map((item) =>
    item.requestId === requestId ? { ...item, response } : item
  );
  return updateSession(sessionId, { pendingNetworkRequests: pending });
}

async function takePendingNetworkRequest(sessionId, requestId) {
  const current = await getSession();
  if (!current || current.sessionId !== sessionId) {
    return null;
  }
  const item = (current.pendingNetworkRequests || []).find((candidate) => candidate.requestId === requestId) || null;
  if (!item) {
    return null;
  }
  await updateSession(sessionId, {
    pendingNetworkRequests: current.pendingNetworkRequests.filter((candidate) => candidate.requestId !== requestId)
  });
  return item;
}

async function sendNetworkEvidence(session, eventType, network) {
  if (!policy.validateNetworkEvidence(network)) {
    throw new BridgeRequestError("INVALID_NETWORK_EVIDENCE");
  }
  const updated = await sendSequencedEvent(session, eventType, { network });
  await updateSession(session.sessionId, { continuityStatus: "observing" });
  await setBadge(session.tabId, "LIVE", "#1f883d");
  return updated;
}

async function requestPostData(tabId, requestId, fallback) {
  if (typeof fallback === "string") {
    return fallback;
  }
  try {
    const result = await chrome.debugger.sendCommand(
      { tabId },
      "Network.getRequestPostData",
      { requestId }
    );
    return typeof result?.postData === "string" ? result.postData : null;
  } catch (_error) {
    return null;
  }
}

async function processGraphqlRequest(session, params) {
  const matched = matchedGraphqlUrl(session, params?.request?.url);
  if (!matched || session.stopping) {
    return;
  }
  const requestId = String(params.requestId || "");
  if (!requestId || requestId.length > 256) {
    throw new BridgeRequestError("INVALID_NETWORK_REQUEST_ID");
  }
  const postData = await requestPostData(session.tabId, requestId, params.request.postData);
  const current = await getSession();
  if (!current || current.sessionId !== session.sessionId || current.stopping) {
    return;
  }
  const body = await bodyEvidence(postData, false, networkPolicy.maximumRequestBodyBytes, current);
  const pending = {
    requestId,
    endpoint: matched.endpoint,
    url: matched.url,
    requestTimestamp: Number.isFinite(params.timestamp) ? params.timestamp : null,
    response: null
  };
  await setPendingNetworkRequest(session.sessionId, pending);
  const network = {
    schemaVersion: policy.PROTOCOL_VERSION,
    contractVersion: policy.CONTRACT_VERSION,
    sourceTrust: policy.NETWORK_SOURCE_TRUST,
    kind: "graphql-request",
    requestId,
    observedAt: new Date().toISOString(),
    tabId: session.tabId,
    url: matched.url,
    endpoint: matched.endpoint,
    method: String(params.request.method || "GET").toUpperCase(),
    resourceType: String(params.type || "Other"),
    headers: filteredHeaders(params.request.headers),
    operationNames: extractOperationNames(postData),
    body
  };
  await sendNetworkEvidence(await getSession(), "network.graphql.request", network);
}

async function processGraphqlResponse(session, params) {
  const requestId = String(params?.requestId || "");
  const current = await getSession();
  const pending = current?.pendingNetworkRequests?.find((item) => item.requestId === requestId);
  if (!pending || current.stopping) {
    return;
  }
  const response = params.response || {};
  const matched = matchedGraphqlUrl(current, response.url || pending.url);
  if (!matched) {
    return;
  }
  await updatePendingNetworkResponse(session.sessionId, requestId, {
    url: matched.url,
    endpoint: matched.endpoint,
    status: Number.isInteger(response.status) ? response.status : 0,
    statusText: String(response.statusText || ""),
    mimeType: String(response.mimeType || ""),
    protocol: String(response.protocol || ""),
    fromDiskCache: Boolean(response.fromDiskCache),
    fromServiceWorker: Boolean(response.fromServiceWorker),
    headers: filteredHeaders(response.headers),
    timing: response.timing && typeof response.timing === "object" ? structuredClone(response.timing) : {}
  });
}

async function processGraphqlFinished(session, params) {
  const requestId = String(params?.requestId || "");
  const pending = await takePendingNetworkRequest(session.sessionId, requestId);
  if (!pending || !pending.response) {
    return;
  }
  let result;
  try {
    result = await chrome.debugger.sendCommand(
      { tabId: session.tabId },
      "Network.getResponseBody",
      { requestId }
    );
  } catch (_error) {
    result = null;
  }
  const current = await getSession();
  if (!current || current.sessionId !== session.sessionId) {
    return;
  }
  const body = result && typeof result.body === "string"
    ? await bodyEvidence(result.body, result.base64Encoded === true, networkPolicy.maximumResponseBodyBytes, current)
    : cdpBodyErrorEvidence();
  const response = pending.response;
  const network = {
    schemaVersion: policy.PROTOCOL_VERSION,
    contractVersion: policy.CONTRACT_VERSION,
    sourceTrust: policy.NETWORK_SOURCE_TRUST,
    kind: "graphql-response",
    requestId,
    observedAt: new Date().toISOString(),
    tabId: session.tabId,
    url: response.url,
    endpoint: response.endpoint,
    status: response.status,
    statusText: response.statusText,
    mimeType: response.mimeType,
    protocol: response.protocol,
    fromDiskCache: response.fromDiskCache,
    fromServiceWorker: response.fromServiceWorker,
    headers: response.headers,
    timing: response.timing,
    encodedDataLength: Number.isFinite(params.encodedDataLength) ? params.encodedDataLength : 0,
    body
  };
  await sendNetworkEvidence(await getSession(), "network.graphql.response", network);
}

async function processGraphqlFailure(session, params) {
  const requestId = String(params?.requestId || "");
  const pending = await takePendingNetworkRequest(session.sessionId, requestId);
  if (!pending) {
    return;
  }
  const network = {
    schemaVersion: policy.PROTOCOL_VERSION,
    contractVersion: policy.CONTRACT_VERSION,
    sourceTrust: policy.NETWORK_SOURCE_TRUST,
    kind: "graphql-failure",
    requestId,
    observedAt: new Date().toISOString(),
    tabId: session.tabId,
    url: pending.url,
    endpoint: pending.endpoint,
    errorText: String(params.errorText || "NETWORK_LOADING_FAILED").slice(0, 4096),
    canceled: Boolean(params.canceled),
    blockedReason: params.blockedReason ? String(params.blockedReason).slice(0, 256) : null
  };
  await sendNetworkEvidence(await getSession(), "network.graphql.failure", network);
}

async function processDebuggerEvent(source, method, params) {
  const session = await getSession();
  if (!session || !networkPolicy.enabled || !session.debuggerAttached || source.tabId !== session.tabId) {
    return;
  }
  if (method === "Network.requestWillBeSent") {
    await processGraphqlRequest(session, params);
  } else if (method === "Network.responseReceived") {
    await processGraphqlResponse(session, params);
  } else if (method === "Network.loadingFinished") {
    await processGraphqlFinished(session, params);
  } else if (method === "Network.loadingFailed") {
    await processGraphqlFailure(session, params);
  }
}

async function attachNetworkDebugger(session) {
  if (!networkPolicy.enabled) {
    return session;
  }
  try {
    await chrome.debugger.attach({ tabId: session.tabId }, "1.3");
    session = await updateSession(session.sessionId, {
      debuggerAttached: true,
      debuggerDetachExpected: false
    });
    await chrome.debugger.sendCommand({ tabId: session.tabId }, "Network.enable", {
      maxTotalBufferSize: networkPolicy.maximumSessionBodyBytes,
      maxResourceBufferSize: networkPolicy.maximumResponseBodyBytes,
      maxPostDataSize: networkPolicy.maximumRequestBodyBytes
    });
    return session;
  } catch (_error) {
    try {
      await chrome.debugger.detach({ tabId: session.tabId });
    } catch (_detachError) {
      // The attach may have failed before Chrome created a debugger session.
    }
    await updateSession(session.sessionId, { debuggerAttached: false });
    throw new BridgeRequestError("DEBUGGER_ATTACH_FAILED");
  }
}

async function detachNetworkDebugger(session) {
  if (!networkPolicy.enabled || !session?.debuggerAttached) {
    return true;
  }
  await updateSession(session.sessionId, { debuggerDetachExpected: true });
  try {
    await chrome.debugger.sendCommand({ tabId: session.tabId }, "Network.disable");
  } catch (_error) {
    // Detach remains authoritative if the target already stopped its Network domain.
  }
  try {
    await chrome.debugger.detach({ tabId: session.tabId });
    await updateSession(session.sessionId, { debuggerAttached: false });
    return true;
  } catch (_error) {
    await updateSession(session.sessionId, { debuggerAttached: false });
    return false;
  }
}

async function flushPendingNetworkFailures(session, reason) {
  const current = await getSession();
  if (!current || current.sessionId !== session.sessionId) {
    return;
  }
  const pendingItems = [...(current.pendingNetworkRequests || [])];
  await updateSession(session.sessionId, { pendingNetworkRequests: [] });
  for (const pending of pendingItems) {
    const network = {
      schemaVersion: policy.PROTOCOL_VERSION,
      contractVersion: policy.CONTRACT_VERSION,
      sourceTrust: policy.NETWORK_SOURCE_TRUST,
      kind: "graphql-failure",
      requestId: pending.requestId,
      observedAt: new Date().toISOString(),
      tabId: session.tabId,
      url: pending.url,
      endpoint: pending.endpoint,
      errorText: reason,
      canceled: true,
      blockedReason: null
    };
    await sendNetworkEvidence(await getSession(), "network.graphql.failure", network);
  }
}

async function injectObserverScripts(session, options = {}) {
  const storedSession = await getSession();
  if (!storedSession || storedSession.sessionId !== session.sessionId) {
    return { ok: false, code: "SESSION_STATE_LOST" };
  }
  try {
    session = await transmitPending(storedSession);
  } catch (error) {
    const code = error?.code || "BRIDGE_WRITE_FAILED";
    await abortSession(code);
    return { ok: false, code };
  }
  let tab;
  try {
    tab = await chrome.tabs.get(session.tabId);
  } catch (_error) {
    await abortSession("TAB_UNAVAILABLE");
    return { ok: false, code: "TAB_UNAVAILABLE" };
  }
  const currentUrl = policy.parseObservedUrl(tab.url || "");
  if (!currentUrl || currentUrl.origin !== session.origin) {
    await abortSession("LEFT_OBSERVED_ORIGIN");
    return { ok: false, code: "LEFT_OBSERVED_ORIGIN" };
  }

  let lastCode = "INJECTION_FAILED";
  for (const waitMilliseconds of RESUME_RETRY_DELAYS_MS) {
    if (waitMilliseconds > 0) {
      await delay(waitMilliseconds);
    }
    try {
      await chrome.scripting.executeScript({
        target: { tabId: session.tabId },
        files: ["observer-config.js", "observer-policy.js", "observer-content.js"],
        world: "ISOLATED"
      });
      const confirmation = await chrome.tabs.sendMessage(session.tabId, { type: "ping-content" });
      if (confirmation?.active === true && confirmation.sessionId === session.sessionId) {
        await updateSession(session.sessionId, {
          continuityStatus: "observing",
          lastConfirmedAt: new Date().toISOString(),
          lastError: null,
          lastUrl: policy.normalizeObservedUrl(tab.url || "")
        });
        await setBadge(session.tabId, "LIVE", "#1f883d");
        return { ok: true, injected: true, confirmed: true };
      }
      lastCode = "CONTENT_CONFIRMATION_FAILED";
    } catch (_error) {
      lastCode = "INJECTION_FAILED";
    }
  }

  if (options.abortOnFailure !== false) {
    await abortSession(lastCode);
  } else {
    await updateSession(session.sessionId, {
      continuityStatus: "reinjection-failed",
      lastError: lastCode
    });
    await setLastError(lastCode);
    await setBadge(session.tabId, "ERR", "#cf222e");
  }
  return { ok: false, code: lastCode };
}

async function startSession(_message) {
  const tab = await getActiveTab();
  if (!tab || !Number.isInteger(tab.id)) {
    return { ok: false, code: "NO_ACTIVE_TAB" };
  }
  if (tab.incognito) {
    return { ok: false, code: "INCOGNITO_NOT_SUPPORTED" };
  }
  const startUrl = policy.normalizeObservedUrl(tab.url || "");
  if (!startUrl) {
    return { ok: false, code: "ORIGIN_NOT_ALLOWED" };
  }
  if (await getSession()) {
    return { ok: false, code: "SESSION_ALREADY_ACTIVE" };
  }

  await clearLastError();
  let session = {
    sessionId: crypto.randomUUID(),
    tabId: tab.id,
    windowId: tab.windowId,
    startedAt: new Date().toISOString(),
    startUrl,
    origin: new URL(startUrl).origin,
    bridgePort: policy.CONFIG.bridgePort,
    bridgeToken: null,
    bridgeConnected: false,
    continuityStatus: "connecting",
    observationCount: 0,
    lastObservationAt: null,
    lastObservationKind: null,
    lastObservationId: null,
    lastSnapshotSignature: null,
    nextSequence: 0,
    lastAckHash: null,
    pendingEvent: null,
    lastError: null,
    stopping: false,
    debuggerAttached: false,
    debuggerDetachExpected: false,
    pendingNetworkRequests: [],
    networkEventCount: 0,
    networkBodyBytes: 0,
    incompleteNetworkEvents: 0,
    lastNetworkAt: null,
    lastNetworkKind: null
  };

  try {
    await setSession(session);
    const readback = await getSession();
    if (!readback || readback.sessionId !== session.sessionId || readback.tabId !== session.tabId) {
      throw new Error("SESSION_READBACK_FAILED");
    }
  } catch (_error) {
    await clearSession();
    await setLastError("SESSION_READBACK_FAILED");
    return { ok: false, code: "SESSION_READBACK_FAILED" };
  }

  try {
    session = await connectBridge(await getSession());
  } catch (error) {
    const code = error?.code || "BRIDGE_UNAVAILABLE";
    await clearSession();
    await setLastError(code);
    return { ok: false, code };
  }

  try {
    await sendSequencedEvent(session, "session.started", startPayload(session));
  } catch (error) {
    const code = error?.code || "BRIDGE_UNAVAILABLE";
    await abortSession(code);
    return { ok: false, code };
  }

  try {
    session = await attachNetworkDebugger(await getSession());
  } catch (error) {
    const code = error?.code || "DEBUGGER_ATTACH_FAILED";
    await abortSession(code);
    return { ok: false, code };
  }

  const injection = await injectObserverScripts(session, { abortOnFailure: true });
  if (!injection.ok) {
    return injection;
  }
  return { ok: true, injection };
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hmacSha256(secret, value) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function forwardObservation(session, observation) {
  const current = await getSession();
  if (!current || current.sessionId !== session.sessionId) {
    throw new BridgeRequestError("SESSION_STATE_LOST");
  }
  session = await transmitPending(current);
  if (session.lastObservationId === observation.observationId) {
    return { ok: true, stored: false, duplicate: true, observationCount: session.observationCount };
  }
  if (observation.kind === "snapshot") {
    const computedHash = await sha256(observation.sanitizedHtml);
    if (computedHash !== observation.sha256) {
      throw new BridgeRequestError("SNAPSHOT_HASH_MISMATCH");
    }
    const signature = `${observation.url}\n${observation.sha256}`;
    if (observation.reason !== "final" && session.lastSnapshotSignature === signature) {
      return { ok: true, stored: false, duplicate: true, observationCount: session.observationCount };
    }
  }

  const updated = await sendSequencedEvent(session, "observation", { observation });
  await updateSession(session.sessionId, { continuityStatus: "observing" });
  await setBadge(session.tabId, "LIVE", "#1f883d");
  return {
    ok: true,
    stored: true,
    duplicate: false,
    sequence: updated.nextSequence - 1,
    observationCount: updated.observationCount
  };
}

async function stopSession(reason) {
  let session = await getSession();
  if (!session) {
    return { ok: true, stopped: false, reason };
  }
  session = await updateSession(session.sessionId, { stopping: true }) || session;
  await evidenceQueue;
  try {
    await flushPendingNetworkFailures(session, "SESSION_STOPPED_WITH_REQUEST_PENDING");
  } catch (error) {
    const code = error?.code || "NETWORK_FLUSH_FAILED";
    await abortSession(code);
    return { ok: false, stopped: true, reason, code };
  }
  let flush = { ok: false, flushed: false, flushCode: "CONTENT_UNAVAILABLE" };
  try {
    flush = await chrome.tabs.sendMessage(session.tabId, { type: "stop-content" });
  } catch (_error) {
    // The selected tab may be navigating or closed.
  }
  const finalObservationFlushed = Boolean(flush?.flushed === true);
  const flushCode = finalObservationFlushed ? null : flush?.flushCode || "FINAL_OBSERVATION_NOT_CONFIRMED";
  const current = await getSession();
  if (!current || current.sessionId !== session.sessionId) {
    const code = await getLastError() || flushCode || "SESSION_STATE_LOST";
    return {
      ok: false,
      stopped: true,
      reason,
      finalObservationFlushed,
      bridgeStopped: false,
      code
    };
  }
  await evidenceQueue;
  const debuggerDetached = await detachNetworkDebugger(await getSession() || current);
  if (!debuggerDetached) {
    await abortSession("DEBUGGER_DETACH_FAILED");
    return {
      ok: false,
      stopped: true,
      reason,
      finalObservationFlushed,
      bridgeStopped: false,
      code: "DEBUGGER_DETACH_FAILED"
    };
  }
  const terminalCurrent = await getSession();
  if (!terminalCurrent) {
    return { ok: false, stopped: true, reason, code: "SESSION_STATE_LOST" };
  }
  let bridgeStopped = false;
  let bridgeTransportReady = false;
  try {
    const terminalSession = await sendSequencedEvent(
      terminalCurrent,
      finalObservationFlushed ? "session.stopped" : "session.aborted",
      stopPayload(finalObservationFlushed, finalObservationFlushed ? reason : flushCode)
    );
    bridgeStopped = true;
    bridgeTransportReady = terminalSession.lastBridgeTransportReady === true;
  } catch (_error) {
    // An absent stop event leaves the bridge-side session visibly incomplete.
  }
  await clearSession();
  const complete = finalObservationFlushed && bridgeStopped && bridgeTransportReady;
  const finalCode = complete
    ? null
    : !bridgeStopped ? "BRIDGE_STOP_FAILED"
      : !finalObservationFlushed ? flushCode
        : "BRIDGE_TRANSPORT_INCOMPLETE";
  if (finalCode) {
    await setLastError(finalCode);
  }
  try {
    await setBadge(session.tabId, complete ? "" : "ERR", complete ? "#1f883d" : "#cf222e");
  } catch (_error) {
    // The tab may no longer exist.
  }
  return {
    ok: complete,
    stopped: true,
    reason,
    finalObservationFlushed,
    bridgeStopped,
    bridgeTransportReady,
    code: finalCode
  };
}

async function observeNow() {
  const [session, activeTab] = await Promise.all([getSession(), getActiveTab()]);
  if (!session) {
    return { ok: false, code: "NO_ACTIVE_SESSION" };
  }
  if (!activeTab || activeTab.id !== session.tabId) {
    return { ok: false, code: "SWITCH_TO_OBSERVED_TAB" };
  }
  try {
    const response = await chrome.tabs.sendMessage(session.tabId, { type: "observe-now" });
    if (response?.ok === true) {
      return response;
    }
  } catch (_error) {
    // Retry through bounded reinjection.
  }
  const resumed = await injectObserverScripts(session, { abortOnFailure: true });
  if (!resumed.ok) {
    return resumed;
  }
  try {
    return await chrome.tabs.sendMessage(session.tabId, { type: "observe-now" });
  } catch (_error) {
    return { ok: false, code: "OBSERVATION_MESSAGE_FAILED" };
  }
}

async function currentStatus() {
  let [session, activeTab, lastError] = await Promise.all([getSession(), getActiveTab(), getLastError()]);
  if (session?.pendingEvent) {
    try {
      session = await transmitPending(session);
    } catch (error) {
      const code = error?.code || "BRIDGE_WRITE_FAILED";
      await abortSession(code);
      session = null;
      lastError = code;
    }
  }
  return {
    ok: true,
    session: session ? {
      sessionId: session.sessionId,
      tabId: session.tabId,
      windowId: session.windowId,
      startedAt: session.startedAt,
      startUrl: session.startUrl,
      bridgePort: session.bridgePort,
      continuityStatus: session.continuityStatus,
      observationCount: session.observationCount,
      lastObservationAt: session.lastObservationAt,
      lastObservationKind: session.lastObservationKind,
      networkEventCount: session.networkEventCount,
      networkBodyBytes: session.networkBodyBytes,
      incompleteNetworkEvents: session.incompleteNetworkEvents,
      lastNetworkAt: session.lastNetworkAt,
      lastNetworkKind: session.lastNetworkKind,
      debuggerAttached: session.debuggerAttached,
      lastError: session.lastError
    } : null,
    lastError,
    activeTabIsSession: Boolean(session && activeTab && activeTab.id === session.tabId)
  };
}

function serializeLifecycle(operation) {
  const queued = lifecycleQueue.then(operation);
  lifecycleQueue = queued.catch(() => undefined);
  return queued;
}

async function handleMessage(message, sender) {
  if (!message || typeof message !== "object" || sender.id !== chrome.runtime.id) {
    return { ok: false, code: "INVALID_MESSAGE" };
  }
  if (message.type === "start-session") {
    if (Object.keys(message).length !== 1) {
      return { ok: false, code: "INVALID_MESSAGE" };
    }
    return serializeLifecycle(() => startSession(message));
  }
  if (message.type === "stop-session") {
    return serializeLifecycle(() => stopSession("USER_STOPPED"));
  }
  if (message.type === "get-status") {
    return currentStatus();
  }
  if (message.type === "observe-now") {
    return observeNow();
  }

  const session = await getSession();
  const tabId = sender.tab?.id;
  let currentTabUrl = "";
  if (Number.isInteger(tabId)) {
    try {
      currentTabUrl = (await chrome.tabs.get(tabId))?.url || "";
    } catch (_error) {
      currentTabUrl = "";
    }
  }
  const normalizedSenderUrls = [sender.url, sender.tab?.url, currentTabUrl]
    .map((url) => policy.normalizeObservedUrl(url || ""))
    .filter((url) => Boolean(url) && (!session || new URL(url).origin === session.origin));
  const topFrame = sender.frameId === 0;
  if (message.type === "content-ready") {
    const active = Boolean(
      session &&
      topFrame &&
      tabId === session.tabId &&
      normalizedSenderUrls.length > 0
    );
    return { active, sessionId: active ? session.sessionId : null };
  }
  if (message.type === "local-observation-error") {
    if (!session || !topFrame || tabId !== session.tabId || message.sessionId !== session.sessionId ||
        !["INVALID_LOCAL_OBSERVATION", "LOCAL_SNAPSHOT_BUILD_FAILED"].includes(message.code)) {
      return { ok: false, code: "WRONG_OBSERVATION_TAB_OR_SESSION" };
    }
    await abortSession(message.code);
    return { ok: false, code: message.code };
  }
  if (message.type === "observation") {
    if (!session || !topFrame || tabId !== session.tabId || message.sessionId !== session.sessionId) {
      return { ok: false, code: "WRONG_OBSERVATION_TAB_OR_SESSION" };
    }
    const observation = message.observation;
    const serialized = JSON.stringify(observation || null);
    if (!policy.validateObservation(observation) ||
        !normalizedSenderUrls.includes(observation?.url) ||
        policy.containsCredentialLikeValue(serialized)) {
      await abortSession("INVALID_OBSERVATION");
      return { ok: false, code: "INVALID_OBSERVATION" };
    }
    const operation = queueEvidence(async () => {
      const current = await getSession();
      if (!current || current.sessionId !== session.sessionId) {
        throw new BridgeRequestError("SESSION_STATE_LOST");
      }
      return forwardObservation(current, observation);
    });
    try {
      return await operation;
    } catch (error) {
      const code = error?.code || "BRIDGE_WRITE_FAILED";
      await abortSession(code);
      return { ok: false, code };
    }
  }
  return { ok: false, code: "UNKNOWN_MESSAGE" };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse, () => {
    sendResponse({ ok: false, code: "INTERNAL_ERROR" });
  });
  return true;
});

if (networkPolicy.enabled) {
  chrome.debugger.onEvent.addListener((source, method, params) => {
    queueEvidence(() => processDebuggerEvent(source, method, params)).catch(async (error) => {
      const code = error?.code || "NETWORK_CAPTURE_FAILED";
      const session = await getSession();
      if (session) {
        await abortSession(code);
      }
    });
  });

  chrome.debugger.onDetach.addListener((source, reason) => {
    getSession().then(async (session) => {
      if (!session || source.tabId !== session.tabId) {
        return;
      }
      if (session.debuggerDetachExpected) {
        await updateSession(session.sessionId, { debuggerAttached: false });
        return;
      }
      await updateSession(session.sessionId, { debuggerAttached: false });
      await abortSession(reason === "target_closed" ? "TAB_CLOSED" : "DEBUGGER_DETACHED");
    });
  });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status !== "complete") {
    return;
  }
  getSession().then((session) => {
    if (session && !session.stopping && session.tabId === tabId) {
      injectObserverScripts(session, { abortOnFailure: true });
    }
  });
});

chrome.tabs.onRemoved.addListener((tabId) => {
  getSession().then((session) => {
    if (session && session.tabId === tabId) {
      abortSession("TAB_CLOSED");
    }
  });
});

chrome.tabs.onReplaced.addListener((addedTabId, removedTabId) => {
  getSession().then((session) => {
    if (session && session.tabId === removedTabId && addedTabId !== removedTabId) {
      abortSession("TAB_REPLACED");
    }
  });
});
