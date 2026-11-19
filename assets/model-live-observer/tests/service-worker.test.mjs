import assert from "node:assert/strict";
import { createHash, createHmac, randomUUID, webcrypto } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const testRoot = path.dirname(fileURLToPath(import.meta.url));
const extensionRoot = path.resolve(testRoot, "..", "extension");
globalThis.ModelLiveObserverConfig = require("./test-observer-config.cjs");
const policy = require(path.join(extensionRoot, "observer-policy.js"));

function eventSlot() {
  let listener = null;
  return {
    addListener(candidate) { listener = candidate; },
    fire(...args) {
      assert.ok(listener, "listener registered");
      return listener(...args);
    },
    get listener() { return listener; }
  };
}

function nextTurn() {
  return new Promise((resolve) => setImmediate(resolve));
}

function waitFor(predicate, timeoutMs = 1000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      if (predicate()) resolve();
      else if (Date.now() - started > timeoutMs) reject(new Error("timed out waiting for worker state"));
      else setTimeout(check, 5);
    };
    check();
  });
}

function snapshot(url) {
  const sanitizedHtml = "<!doctype html>\n<html><body>fixture page</body></html>";
  return {
    schemaVersion: policy.PROTOCOL_VERSION,
    contractVersion: policy.CONTRACT_VERSION,
    sourceTrust: policy.SOURCE_TRUST,
    kind: "snapshot",
    observationId: randomUUID(),
    observedAt: new Date().toISOString(),
    pageKind: policy.classifyUrl(url),
    url: policy.normalizeObservedUrl(url),
    title: "Fixture",
    reason: "manual",
    sanitizedHtml,
    byteLength: new TextEncoder().encode(sanitizedHtml).byteLength,
    truncated: false,
    sha256: createHash("sha256").update(sanitizedHtml, "utf8").digest("hex"),
    redactions: {
      removedElements: 1,
      removedContentEditable: 0,
      removedComments: 0,
      removedCredentialTextNodes: 0,
      removedAttributes: 1,
      normalizedLinks: 0
    },
    documentState: { readyState: "complete", mutationQuietMs: 0 },
    viewport: {
      innerWidth: 1600,
      innerHeight: 900,
      scrollX: 0,
      scrollY: 0,
      documentWidth: 1600,
      documentHeight: 4000,
      devicePixelRatio: 1
    }
  };
}

function pendingObservationEnvelope(session, observation) {
  const payload = { observation };
  const payloadHash = createHash("sha256")
    .update(policy.canonicalStringify(payload), "utf8")
    .digest("hex");
  const core = {
    schemaVersion: policy.PROTOCOL_VERSION,
    contractVersion: policy.CONTRACT_VERSION,
    sessionId: session.sessionId,
    seq: session.nextSequence,
    eventId: randomUUID(),
    observedAt: new Date().toISOString(),
    eventType: "observation",
    payloadHash,
    previousEventHash: session.lastAckHash
  };
  return {
    ...core,
    payload,
    eventHash: createHash("sha256").update(policy.canonicalStringify(core), "utf8").digest("hex")
  };
}

function createHarness(options = {}) {
  const onMessage = eventSlot();
  const onUpdated = eventSlot();
  const onRemoved = eventSlot();
  const onReplaced = eventSlot();
  const onDebuggerEvent = eventSlot();
  const onDebuggerDetach = eventSlot();
  const injections = [];
  const badges = [];
  const tabMessages = [];
  const bridgeRequests = [];
  const bridgeConnections = [];
  const automaticBridgeSecret = options.connectionSecret || "z".repeat(43);
  const debuggerCommands = [];
  let debuggerAttached = false;
  let sessionState = options.sessionState || {};
  let dropAckUsed = false;
  const activeTab = {
    id: 41,
    windowId: 7,
    active: true,
    incognito: false,
    url: "https://example.com/records?page=1"
  };

  const chrome = {
    runtime: {
      id: "temporary-extension-id",
      onMessage,
      getManifest() { return { version: "0.3.1" }; }
    },
    storage: {
      session: {
        async setAccessLevel() {},
        async get(key) { return Object.hasOwn(sessionState, key) ? { [key]: structuredClone(sessionState[key]) } : {}; },
        async set(values) { sessionState = { ...sessionState, ...structuredClone(values) }; },
        async remove(key) { delete sessionState[key]; }
      }
    },
    tabs: {
      onUpdated,
      onRemoved,
      onReplaced,
      async query() { return [activeTab]; },
      async get(tabId) {
        if (tabId !== activeTab.id) throw new Error("missing tab");
        return activeTab;
      },
      async sendMessage(tabId, message) {
        tabMessages.push({ tabId, message });
        if (message.type === "ping-content") {
          return {
            ok: true,
            active: true,
            sessionId: sessionState.activeModelObserverSession?.sessionId || null
          };
        }
        if (message.type === "stop-content") {
          return options.finalFlush === false
            ? { ok: true, flushed: false, flushCode: "FINAL_OBSERVATION_FAILED" }
            : { ok: true, flushed: true, flushCode: null };
        }
        return { ok: true };
      }
    },
    scripting: {
      async executeScript(details) { injections.push(details); }
    },
    action: {
      async setBadgeBackgroundColor(details) { badges.push({ kind: "color", details }); },
      async setBadgeText(details) { badges.push({ kind: "text", details }); }
    },
    debugger: {
      onEvent: onDebuggerEvent,
      onDetach: onDebuggerDetach,
      async attach(target, version) {
        debuggerCommands.push({ kind: "attach", target: structuredClone(target), version });
        if (options.debuggerAttachFails) throw new Error("simulated debugger attach failure");
        debuggerAttached = true;
      },
      async detach(target) {
        debuggerCommands.push({ kind: "detach", target: structuredClone(target) });
        if (options.debuggerDetachFails) throw new Error("simulated debugger detach failure");
        debuggerAttached = false;
      },
      async sendCommand(target, method, params = {}) {
        debuggerCommands.push({
          kind: "command",
          target: structuredClone(target),
          method,
          params: structuredClone(params)
        });
        if (!debuggerAttached) throw new Error("debugger is not attached");
        if (method === "Network.getRequestPostData") {
          const postData = options.requestBodies?.[params.requestId];
          if (typeof postData !== "string") throw new Error("request body unavailable");
          return { postData };
        }
        if (method === "Network.getResponseBody") {
          const response = options.responseBodies?.[params.requestId];
          if (!response) throw new Error("response body unavailable");
          return structuredClone(response);
        }
        return {};
      }
    }
  };

  async function fetchMock(url, request) {
    assert.equal(request.credentials, "omit");
    assert.equal(request.redirect, "error");
    assert.equal(request.referrerPolicy, "no-referrer");
    if (/^http:\/\/127\.0\.0\.1:\d+\/v1\/connect$/.test(url)) {
      const connectBody = JSON.parse(request.body);
      assert.deepEqual(Object.keys(connectBody).sort(), ["contractVersion", "extensionVersion", "schemaVersion"]);
      assert.equal(connectBody.schemaVersion, policy.PROTOCOL_VERSION);
      assert.equal(connectBody.contractVersion, policy.CONTRACT_VERSION);
      assert.equal(connectBody.extensionVersion, "0.3.1");
      assert.deepEqual(Object.keys(request.headers), ["Content-Type"]);
      assert.equal(request.headers["Content-Type"], "application/json");
      bridgeConnections.push({ url, request: structuredClone({ ...request, signal: undefined }) });
      return {
        ok: true,
        status: 200,
        async json() {
          return {
            ok: true,
            schemaVersion: policy.PROTOCOL_VERSION,
            contractVersion: policy.CONTRACT_VERSION,
            connectionSecret: automaticBridgeSecret
          };
        }
      };
    }
    assert.match(url, /^http:\/\/127\.0\.0\.1:\d+\/v1\/ingest$/);
    assert.equal(request.headers["X-Model-Observer-Protocol"], String(policy.PROTOCOL_VERSION));
    const envelope = JSON.parse(request.body);
    const sessionToken = sessionState.activeModelObserverSession?.bridgeToken;
    assert.equal(typeof sessionToken, "string");
    const expectedAuth = createHmac("sha256", sessionToken)
      .update(policy.canonicalStringify(envelope), "utf8")
      .digest("hex");
    assert.equal(request.headers["X-Model-Observer-Auth"], expectedAuth);
    assert.equal(Object.hasOwn(request.headers, "X-Model-Observer-Token"), false);
    bridgeRequests.push({ url, request: structuredClone({ ...request, signal: undefined }), envelope });
    assert.equal(JSON.stringify(envelope).includes(sessionToken), false);
    if (options.failSequence === envelope.seq) {
      const errorCore = { ok: false, code: "BRIDGE_PERSISTENCE_FAILED" };
      return {
        ok: false,
        status: 500,
        async json() {
          return {
            ...errorCore,
            responseAuth: createHmac("sha256", sessionToken)
              .update(policy.canonicalStringify(errorCore), "utf8")
              .digest("hex")
          };
        }
      };
    }
    if (options.eventLimitAt === envelope.seq && envelope.eventType === "observation") {
      const errorCore = { ok: false, code: "BRIDGE_EVENT_LIMIT_REACHED" };
      return {
        ok: false,
        status: 507,
        async json() {
          return {
            ...errorCore,
            responseAuth: createHmac("sha256", sessionToken)
              .update(policy.canonicalStringify(errorCore), "utf8")
              .digest("hex")
          };
        }
      };
    }
    if (options.dropAckOnceAt === envelope.seq && !dropAckUsed) {
      dropAckUsed = true;
      throw new TypeError("simulated lost acknowledgment");
    }
    const terminal = envelope.eventType === "session.stopped" || envelope.eventType === "session.aborted";
    const responseCore = {
      ok: true,
      duplicate: false,
      sequence: envelope.seq,
      eventHash: envelope.eventHash,
      captureComplete: envelope.eventType === "session.stopped" && envelope.payload.complete === true,
      bridgeComplete: terminal,
      transportReady: envelope.eventType === "session.stopped" && envelope.payload.complete === true && options.transportReady !== false,
      status: envelope.eventType === "session.stopped" && options.transportReady !== false
        ? "transport-complete"
        : terminal ? "incomplete" : "observing"
    };
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          ...responseCore,
          responseAuth: createHmac("sha256", sessionToken)
            .update(policy.canonicalStringify(responseCore), "utf8")
            .digest("hex")
        };
      }
    };
  }

  const context = vm.createContext({
    chrome,
    console,
    crypto: webcrypto,
    URL,
    TextEncoder,
    AbortController,
    fetch: fetchMock,
    setTimeout,
    clearTimeout,
    structuredClone,
    importScripts() { context.ModelLiveObserverPolicy = policy; }
  });
  vm.runInContext(fs.readFileSync(path.join(extensionRoot, "service-worker.js"), "utf8"), context, {
    filename: "service-worker.js"
  });

  async function send(message, sender = { id: chrome.runtime.id }) {
    return new Promise((resolve) => {
      const keepAlive = onMessage.listener(message, sender, resolve);
      assert.equal(keepAlive, true);
    });
  }

  return {
    activeTab,
    badges,
    bridgeRequests,
    bridgeConnections,
    chrome,
    debuggerCommands,
    debuggerAttached: () => debuggerAttached,
    injections,
    onRemoved,
    onReplaced,
    onUpdated,
    onDebuggerEvent,
    onDebuggerDetach,
    send,
    session: () => sessionState.activeModelObserverSession || null,
    lastError: () => sessionState.lastModelObserverError || null,
    sessionState: () => structuredClone(sessionState),
    tabMessages
  };
}

function sender(harness) {
  return {
    id: harness.chrome.runtime.id,
    frameId: 0,
    tab: { id: harness.activeTab.id, url: harness.activeTab.url },
    url: harness.activeTab.url
  };
}

test("start pins one configured tab and exact origin with a token-free sequenced envelope", async () => {
  const harness = createHarness();
  const started = await harness.send({ type: "start-session" });
  assert.equal(started.ok, true, JSON.stringify({ started, debuggerCommands: harness.debuggerCommands }));
  assert.equal(harness.session().tabId, 41);
  assert.equal(harness.session().nextSequence, 1);
  assert.equal(harness.session().pendingEvent, null);
  assert.equal(harness.session().origin, "https://example.com");
  assert.equal(harness.session().bridgePort, 43116);
  assert.equal(harness.bridgeConnections.length, 1);
  assert.deepEqual(Array.from(harness.injections[0].files), ["observer-config.js", "observer-policy.js", "observer-content.js"]);
  assert.equal(harness.bridgeRequests.length, 1);
  assert.equal(harness.bridgeRequests[0].envelope.eventType, "session.started");
  assert.equal(harness.bridgeRequests[0].envelope.seq, 0);
  assert.equal(JSON.stringify(harness.bridgeRequests[0].envelope).includes("z".repeat(43)), false);
  const status = await harness.send({ type: "get-status" });
  assert.equal(Object.hasOwn(status.session, "bridgeToken"), false);

  harness.onUpdated.fire(99, { status: "complete" });
  await nextTurn();
  assert.equal(harness.injections.length, 1);
  harness.onUpdated.fire(41, { status: "complete" });
  await nextTurn();
  await nextTurn();
  assert.equal(harness.injections.length, 2);
});

test("start rejects owner supplied bridge connection fields", async () => {
  const harness = createHarness();
  const rejected = await harness.send({
    type: "start-session",
    bridgePort: 43116,
    bridgeToken: "owner-must-not-enter-this"
  });
  assert.equal(rejected.ok, false);
  assert.equal(rejected.code, "INVALID_MESSAGE");
  assert.equal(harness.bridgeConnections.length, 0);
  assert.equal(harness.bridgeRequests.length, 0);
});

test("configured GraphQL exchange retains development bodies and non-cookie headers", async () => {
  const responseBody = JSON.stringify({ data: { account: { id: "account-7", total: 49022.91 } } });
  const harness = createHarness({
    responseBodies: {
      "request-1": { body: responseBody, base64Encoded: false }
    }
  });
  const started = await harness.send({ type: "start-session" });
  assert.equal(started.ok, true);
  const requestBody = JSON.stringify({
    operationName: "AccountDevelopmentQuery",
    query: "query AccountDevelopmentQuery($accountId: ID!) { account(id: $accountId) { id total } }",
    variables: { accountId: "private-account-id" }
  });
  harness.onDebuggerEvent.fire({ tabId: 41 }, "Network.requestWillBeSent", {
    requestId: "request-1",
    timestamp: 100,
    type: "Fetch",
    request: {
      url: "https://example.com/graphql?source=account",
      method: "POST",
      headers: {
        Authorization: "Bearer retained-development-token",
        Cookie: "excluded-session-cookie=1",
        "Content-Type": "application/json"
      },
      postData: requestBody,
      hasPostData: true
    }
  });
  await waitFor(() => harness.bridgeRequests.length === 2);
  const requestEvidence = harness.bridgeRequests[1].envelope;
  assert.equal(requestEvidence.eventType, "network.graphql.request");
  assert.equal(requestEvidence.payload.network.body.body, requestBody);
  assert.deepEqual(Array.from(requestEvidence.payload.network.operationNames), ["AccountDevelopmentQuery"]);
  assert.equal(requestEvidence.payload.network.headers.Authorization, "Bearer retained-development-token");
  assert.equal(Object.hasOwn(requestEvidence.payload.network.headers, "Cookie"), false);
  assert.match(requestEvidence.payload.network.body.body, /private-account-id/);

  harness.onDebuggerEvent.fire({ tabId: 41 }, "Network.responseReceived", {
    requestId: "request-1",
    response: {
      url: "https://example.com/graphql?source=account",
      status: 200,
      statusText: "OK",
      mimeType: "application/json",
      protocol: "h2",
      fromDiskCache: false,
      fromServiceWorker: false,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": "excluded-response-cookie=1",
        "X-Request-Trace": "trace-7"
      },
      timing: { requestTime: 100, receiveHeadersEnd: 25.5 }
    }
  });
  harness.onDebuggerEvent.fire({ tabId: 41 }, "Network.loadingFinished", {
    requestId: "request-1",
    timestamp: 101,
    encodedDataLength: 128
  });
  await waitFor(() => harness.bridgeRequests.length === 3);
  const responseEvidence = harness.bridgeRequests[2].envelope;
  assert.equal(responseEvidence.eventType, "network.graphql.response");
  assert.equal(responseEvidence.payload.network.body.body, responseBody);
  assert.equal(responseEvidence.payload.network.headers["X-Request-Trace"], "trace-7");
  assert.equal(Object.hasOwn(responseEvidence.payload.network.headers, "Set-Cookie"), false);
  assert.equal(harness.session().networkEventCount, 2);
  assert.equal(harness.session().incompleteNetworkEvents, 0);

  harness.onDebuggerEvent.fire({ tabId: 99 }, "Network.requestWillBeSent", {
    requestId: "wrong-tab",
    request: { url: "https://example.com/graphql", method: "POST", headers: {}, postData: "{}" }
  });
  harness.onDebuggerEvent.fire({ tabId: 41 }, "Network.requestWillBeSent", {
    requestId: "wrong-origin",
    request: { url: "https://second.example/graphql", method: "POST", headers: {}, postData: "{}" }
  });
  await nextTurn();
  assert.equal(harness.bridgeRequests.length, 3);
});

test("unexpected debugger detach aborts the pinned session", async () => {
  const harness = createHarness();
  await harness.send({ type: "start-session" });
  harness.onDebuggerDetach.fire({ tabId: 41 }, "canceled_by_user");
  await waitFor(() => harness.session() === null);
  assert.equal(harness.lastError(), "DEBUGGER_DETACHED");
  assert.equal(harness.bridgeRequests.at(-1).envelope.eventType, "session.aborted");
  assert.equal(harness.bridgeRequests.at(-1).envelope.payload.reason, "DEBUGGER_DETACHED");
});

test("valid observations are hash-checked, ordered and authorized to the top frame", async () => {
  const harness = createHarness();
  await harness.send({ type: "start-session" });
  const observation = snapshot(harness.activeTab.url);
  const stored = await harness.send({
    type: "observation",
    sessionId: harness.session().sessionId,
    observation
  }, sender(harness));
  assert.equal(stored.ok, true);
  assert.equal(stored.sequence, 1);
  assert.equal(harness.session().nextSequence, 2);
  assert.equal(harness.session().lastObservationId, observation.observationId);
  assert.equal(harness.bridgeRequests[1].envelope.previousEventHash, harness.bridgeRequests[0].envelope.eventHash);

  const duplicate = await harness.send({
    type: "observation",
    sessionId: harness.session().sessionId,
    observation
  }, sender(harness));
  assert.equal(duplicate.duplicate, true);
  assert.equal(harness.bridgeRequests.length, 2);

  const wrongFrame = await harness.send({
    type: "observation",
    sessionId: harness.session().sessionId,
    observation: snapshot(harness.activeTab.url)
  }, { ...sender(harness), frameId: 1 });
  assert.equal(wrongFrame.code, "WRONG_OBSERVATION_TAB_OR_SESSION");
});

test("same-document AJAX pagination accepts the live tab URL without trusting unrelated URL claims", async () => {
  const harness = createHarness();
  await harness.send({ type: "start-session" });

  const originalDocumentUrl = harness.activeTab.url;
  const currentTabUrl = "https://example.com/records?page=2&pagesize=10";
  harness.activeTab.url = currentTabUrl;
  const paginatedObservation = snapshot(currentTabUrl);
  const accepted = await harness.send({
    type: "observation",
    sessionId: harness.session().sessionId,
    observation: paginatedObservation
  }, {
    id: harness.chrome.runtime.id,
    frameId: 0,
    tab: { id: harness.activeTab.id, url: originalDocumentUrl },
    url: originalDocumentUrl
  });
  assert.equal(accepted.ok, true);
  assert.equal(accepted.sequence, 1);

  const unrelatedUrl = "https://example.com/unrelated?page=3&pagesize=10";
  const rejected = await harness.send({
    type: "observation",
    sessionId: harness.session().sessionId,
    observation: snapshot(unrelatedUrl)
  }, {
    id: harness.chrome.runtime.id,
    frameId: 0,
    tab: { id: harness.activeTab.id, url: originalDocumentUrl },
    url: originalDocumentUrl
  });
  assert.equal(rejected.ok, false);
  assert.equal(rejected.code, "INVALID_OBSERVATION");
  assert.equal(harness.session(), null);
});

test("a lost acknowledgment replays the exact pending event before a terminal abort", async () => {
  const harness = createHarness({ dropAckOnceAt: 1 });
  await harness.send({ type: "start-session" });
  const rejected = await harness.send({
    type: "observation",
    sessionId: harness.session().sessionId,
    observation: snapshot(harness.activeTab.url)
  }, sender(harness));
  assert.equal(rejected.code, "BRIDGE_UNAVAILABLE");
  assert.equal(harness.session(), null);
  assert.equal(harness.lastError(), "BRIDGE_UNAVAILABLE");
  assert.deepEqual(harness.bridgeRequests.map(({ envelope }) => envelope.seq), [0, 1, 1, 2]);
  assert.equal(harness.bridgeRequests[1].envelope.eventId, harness.bridgeRequests[2].envelope.eventId);
  assert.equal(harness.bridgeRequests[3].envelope.eventType, "session.aborted");
});

test("a new service-worker instance replays a durable pending outbox event", async () => {
  const original = createHarness();
  await original.send({ type: "start-session" });
  const carriedState = original.sessionState();
  const observation = snapshot(original.activeTab.url);
  carriedState.activeModelObserverSession.pendingEvent = pendingObservationEnvelope(
    carriedState.activeModelObserverSession,
    observation
  );
  const restarted = createHarness({ sessionState: carriedState });
  const status = await restarted.send({ type: "get-status" });
  assert.equal(status.ok, true);
  assert.equal(restarted.bridgeRequests.length, 1);
  assert.equal(restarted.bridgeRequests[0].envelope.seq, 1);
  assert.equal(restarted.session().pendingEvent, null);
  assert.equal(restarted.session().nextSequence, 2);
  assert.equal(restarted.session().lastObservationId, observation.observationId);
});

test("worker-restart replay replaces an authenticated over-limit pending event with abort", async () => {
  const original = createHarness();
  await original.send({ type: "start-session" });
  const carriedState = original.sessionState();
  const observation = snapshot(original.activeTab.url);
  carriedState.activeModelObserverSession.pendingEvent = pendingObservationEnvelope(
    carriedState.activeModelObserverSession,
    observation
  );
  const restarted = createHarness({ sessionState: carriedState, eventLimitAt: 1 });
  const status = await restarted.send({ type: "get-status" });
  assert.equal(status.ok, true);
  assert.equal(status.session, null);
  assert.equal(status.lastError, "BRIDGE_EVENT_LIMIT_REACHED");
  assert.deepEqual(restarted.bridgeRequests.map(({ envelope }) => envelope.seq), [1, 1]);
  assert.deepEqual(restarted.bridgeRequests.map(({ envelope }) => envelope.eventType), [
    "observation",
    "session.aborted"
  ]);
  assert.equal(restarted.bridgeRequests[1].envelope.previousEventHash, carriedState.activeModelObserverSession.lastAckHash);
});

test("bridge persistence failure aborts and same-tab origin exit cannot continue", async () => {
  const failed = createHarness({ failSequence: 1 });
  await failed.send({ type: "start-session" });
  const response = await failed.send({
    type: "observation",
    sessionId: failed.session().sessionId,
    observation: snapshot(failed.activeTab.url)
  }, sender(failed));
  assert.equal(response.code, "BRIDGE_PERSISTENCE_FAILED");
  assert.equal(failed.session(), null);

  const navigated = createHarness();
  await navigated.send({ type: "start-session" });
  navigated.activeTab.url = "https://second.example/";
  navigated.onUpdated.fire(41, { status: "complete" });
  await waitFor(() => navigated.session() === null);
  assert.equal(navigated.session(), null);
  assert.equal(navigated.lastError(), "LEFT_OBSERVED_ORIGIN");
});

test("authenticated event-limit rejection replaces the pending observation with a terminal abort", async () => {
  const harness = createHarness({ eventLimitAt: 1 });
  await harness.send({ type: "start-session" });
  const response = await harness.send({
    type: "observation",
    sessionId: harness.session().sessionId,
    observation: snapshot(harness.activeTab.url)
  }, sender(harness));
  assert.equal(response.code, "BRIDGE_EVENT_LIMIT_REACHED");
  assert.equal(harness.session(), null);
  assert.deepEqual(harness.bridgeRequests.map(({ envelope }) => envelope.seq), [0, 1, 1]);
  assert.deepEqual(harness.bridgeRequests.map(({ envelope }) => envelope.eventType), [
    "session.started",
    "observation",
    "session.aborted"
  ]);
  assert.equal(harness.bridgeRequests[2].envelope.previousEventHash, harness.bridgeRequests[0].envelope.eventHash);
});

test("local observer failure aborts durably and lifecycle commands serialize", async () => {
  const localFailure = createHarness();
  await localFailure.send({ type: "start-session" });
  const failed = await localFailure.send({
    type: "local-observation-error",
    sessionId: localFailure.session().sessionId,
    code: "INVALID_LOCAL_OBSERVATION"
  }, sender(localFailure));
  assert.equal(failed.code, "INVALID_LOCAL_OBSERVATION");
  assert.equal(localFailure.session(), null);
  assert.equal(localFailure.bridgeRequests.at(-1).envelope.eventType, "session.aborted");

  const lifecycle = createHarness();
  const starts = await Promise.all([
    lifecycle.send({ type: "start-session" }),
    lifecycle.send({ type: "start-session" })
  ]);
  assert.equal(starts.filter((result) => result.ok).length, 1);
  assert.equal(starts.some((result) => result.code === "SESSION_ALREADY_ACTIVE"), true);
  assert.equal(lifecycle.bridgeRequests.filter(({ envelope }) => envelope.eventType === "session.started").length, 1);
  const stops = await Promise.all([
    lifecycle.send({ type: "stop-session" }),
    lifecycle.send({ type: "stop-session" })
  ]);
  assert.equal(stops.filter((result) => result.stopped === true).length, 1);
  assert.equal(lifecycle.bridgeRequests.filter(({ envelope }) => envelope.eventType === "session.stopped").length, 1);
});

test("Stop appends a terminal event only after a confirmed final content flush", async () => {
  const complete = createHarness();
  await complete.send({ type: "start-session" });
  await complete.send({
    type: "observation",
    sessionId: complete.session().sessionId,
    observation: snapshot(complete.activeTab.url)
  }, sender(complete));
  const stopped = await complete.send({ type: "stop-session" });
  assert.equal(stopped.ok, true);
  assert.equal(stopped.finalObservationFlushed, true);
  assert.equal(complete.bridgeRequests.at(-1).envelope.eventType, "session.stopped");
  assert.equal(complete.bridgeRequests.at(-1).envelope.payload.complete, true);
  assert.equal(complete.session(), null);

  const incomplete = createHarness({ finalFlush: false });
  await incomplete.send({ type: "start-session" });
  const incompleteStop = await incomplete.send({ type: "stop-session" });
  assert.equal(incompleteStop.ok, false);
  assert.equal(incomplete.bridgeRequests.at(-1).envelope.eventType, "session.aborted");
  assert.equal(incomplete.bridgeRequests.at(-1).envelope.payload.complete, false);

  const transportIncomplete = createHarness({ transportReady: false });
  await transportIncomplete.send({ type: "start-session" });
  const incompleteTransportStop = await transportIncomplete.send({ type: "stop-session" });
  assert.equal(incompleteTransportStop.ok, false);
  assert.equal(incompleteTransportStop.bridgeStopped, true);
  assert.equal(incompleteTransportStop.bridgeTransportReady, false);
  assert.equal(incompleteTransportStop.code, "BRIDGE_TRANSPORT_INCOMPLETE");
});
