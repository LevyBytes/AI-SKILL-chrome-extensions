import assert from "node:assert/strict";
import { createHash, createHmac, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
globalThis.ModelLiveObserverConfig = require("./test-observer-config.cjs");
const policy = require("../extension/observer-policy.js");
const { createObserverBridge } = await import("../bridge/live-observer-bridge.mjs");
const { validateSession } = await import("../bridge/validate-live-session.mjs");
const testRoot = path.dirname(fileURLToPath(import.meta.url));
const bridgeScript = path.resolve(testRoot, "..", "bridge", "live-observer-bridge.mjs");
const validatorScript = path.resolve(testRoot, "..", "bridge", "validate-live-session.mjs");
const liveRoot = path.resolve(testRoot, "..", "live");

after(() => {
  if (!fs.existsSync(liveRoot)) return;
  assert.deepEqual(fs.readdirSync(liveRoot), [], "bridge tests left live evidence behind");
  fs.rmdirSync(liveRoot);
});

function captureStream() {
  let text = "";
  return {
    write(value) { text += String(value); },
    text() { return text; }
  };
}

function viewport() {
  return {
    innerWidth: 1600,
    innerHeight: 900,
    scrollX: 0,
    scrollY: 0,
    documentWidth: 1600,
    documentHeight: 4000,
    devicePixelRatio: 1
  };
}

function snapshot(url = "https://example.com/records?page=") {
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
    title: "Example records",
    reason: "initial",
    sanitizedHtml,
    byteLength: new TextEncoder().encode(sanitizedHtml).byteLength,
    truncated: false,
    sha256: createHash("sha256").update(sanitizedHtml, "utf8").digest("hex"),
    redactions: {
      removedElements: 1,
      removedContentEditable: 0,
      removedComments: 0,
      removedCredentialTextNodes: 0,
      removedAttributes: 2,
      normalizedLinks: 1
    },
    documentState: { readyState: "complete", mutationQuietMs: 0 },
    viewport: viewport()
  };
}

function envelope(sessionId, seq, eventType, payload, previousEventHash) {
  const payloadHash = createHash("sha256")
    .update(policy.canonicalStringify(payload), "utf8")
    .digest("hex");
  const core = {
    schemaVersion: policy.PROTOCOL_VERSION,
    contractVersion: policy.CONTRACT_VERSION,
    sessionId,
    seq,
    eventId: randomUUID(),
    observedAt: new Date().toISOString(),
    eventType,
    payloadHash,
    previousEventHash
  };
  return {
    ...core,
    payload,
    eventHash: createHash("sha256").update(policy.canonicalStringify(core), "utf8").digest("hex")
  };
}

function networkCapturePolicy() {
  return {
    enabled: true,
    graphqlEndpointPaths: ["/graphql"],
    maximumPendingRequests: 64,
    maximumRequestBodyBytes: 16 * 1024 * 1024,
    maximumResponseBodyBytes: 64 * 1024 * 1024,
    maximumSessionBodyBytes: 512 * 1024 * 1024
  };
}

function networkBody(body) {
  return {
    base64Encoded: false,
    body,
    byteLength: new TextEncoder().encode(body).byteLength,
    complete: true,
    omissionReason: null,
    sha256: createHash("sha256").update(body, "utf8").digest("hex")
  };
}

async function post(bridge, token, value, options = {}) {
  const auth = createHmac("sha256", token)
    .update(policy.canonicalStringify(value), "utf8")
    .digest("hex");
  const origin = Object.hasOwn(options, "origin")
    ? options.origin
    : "chrome-extension://abcdefghijklmnopabcdefghijklmnop";
  if ((options.method || "POST") === "POST" && origin && /^chrome-extension:\/\/[a-p]{32}$/.test(origin) &&
      !bridge.state.pinnedExtensionOrigin && options.autoConnect !== false) {
    const connected = await fetch(`http://127.0.0.1:${bridge.port}/v1/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: origin },
      body: JSON.stringify({
        schemaVersion: policy.PROTOCOL_VERSION,
        contractVersion: policy.CONTRACT_VERSION,
        extensionVersion: "0.3.1"
      })
    });
    assert.equal(connected.status, 200);
    const connection = await connected.json();
    assert.equal(connection.connectionSecret, bridge.token);
  }
  const headers = {
    "Content-Type": "application/json",
    "X-Model-Observer-Auth": auth,
    "X-Model-Observer-Protocol": String(policy.PROTOCOL_VERSION),
    ...(options.headers || {})
  };
  if (origin !== null) headers.Origin = origin;
  return fetch(`http://127.0.0.1:${bridge.port}/v1/ingest`, {
    method: options.method || "POST",
    headers,
    body: options.method === "OPTIONS" ? undefined : JSON.stringify(value)
  });
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function removeTree(directory) {
  fs.rmSync(directory, { recursive: true, force: true, maxRetries: 10, retryDelay: 25 });
}

function rechainSession(sessionDirectory, mutate) {
  const eventsPath = path.join(sessionDirectory, "events.ndjson");
  const statePath = path.join(sessionDirectory, "bridge-state.json");
  const records = fs.readFileSync(eventsPath, "utf8").trim().split("\n").map(JSON.parse);
  mutate(records);
  let previousEventHash = null;
  for (const record of records) {
    let originalPayload = record.payload;
    let snapshotPath = null;
    let evidence = null;
    if (record.payload?.kind === "snapshot" && typeof record.payload.snapshotFile === "string") {
      snapshotPath = path.join(sessionDirectory, ...record.payload.snapshotFile.split("/"));
      evidence = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
      originalPayload = { observation: evidence.observation };
    }
    record.payloadHash = createHash("sha256")
      .update(policy.canonicalStringify(originalPayload), "utf8").digest("hex");
    record.previousEventHash = previousEventHash;
    const core = {
      schemaVersion: record.schemaVersion,
      contractVersion: record.contractVersion,
      sessionId: record.sessionId,
      seq: record.seq,
      eventId: record.eventId,
      observedAt: record.observedAt,
      eventType: record.eventType,
      payloadHash: record.payloadHash,
      previousEventHash: record.previousEventHash
    };
    record.eventHash = createHash("sha256")
      .update(policy.canonicalStringify(core), "utf8").digest("hex");
    previousEventHash = record.eventHash;
    if (evidence && snapshotPath) {
      evidence.schemaVersion = record.schemaVersion;
      evidence.contractVersion = record.contractVersion;
      evidence.sessionId = record.sessionId;
      evidence.seq = record.seq;
      evidence.eventId = record.eventId;
      evidence.payloadHash = record.payloadHash;
      evidence.eventHash = record.eventHash;
      writeJson(snapshotPath, evidence);
    }
  }
  fs.writeFileSync(eventsPath, `${records.map((record) => JSON.stringify(record)).join("\n")}\n`, "utf8");
  const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
  const last = records.at(-1);
  state.extensionSessionId = records[0].sessionId;
  state.expectedSequence = records.length;
  state.lastSequence = last.seq;
  state.lastEventId = last.eventId;
  state.lastEventHash = last.eventHash;
  state.lastEvent = last;
  writeJson(statePath, state);
}

test("bridge persists a contiguous hash chain and acknowledges exact duplicates", async () => {
  const stdout = captureStream();
  const stderr = captureStream();
  const token = "a".repeat(43);
  const bridge = await createObserverBridge({
    outputRoot: liveRoot,
    port: 0,
    token,
    json: true,
    stdout,
    stderr
  });
  try {
    const sessionId = randomUUID();
    const start = envelope(sessionId, 0, "session.started", {
      startedAt: new Date().toISOString(),
      startUrl: "https://example.com/records?page=",
      tabId: 41,
      windowId: 7,
      extensionVersion: "0.3.1",
      networkCapture: networkCapturePolicy()
    }, null);
    const started = await post(bridge, token, start);
    assert.equal(started.status, 200);
    const startedPayload = await started.json();
    assert.equal(startedPayload.ok, true);
    assert.equal(startedPayload.duplicate, false);
    assert.equal(startedPayload.sequence, 0);
    assert.equal(startedPayload.eventHash, start.eventHash);
    assert.match(startedPayload.responseAuth, /^[a-f0-9]{64}$/);
    assert.equal((await post(bridge, token, start, {
      origin: "chrome-extension://bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
    })).status, 403);
    assert.equal((await post(bridge, token, start, { origin: null })).status, 403);

    const observed = envelope(sessionId, 1, "observation", { observation: snapshot() }, start.eventHash);
    const stored = await post(bridge, token, observed);
    assert.equal(stored.status, 200);
    assert.equal((await stored.json()).duplicate, false);
    const duplicate = await post(bridge, token, observed);
    assert.equal(duplicate.status, 200);
    assert.equal((await duplicate.json()).duplicate, true);

    const finalObservation = snapshot();
    finalObservation.reason = "final";
    finalObservation.observationId = randomUUID();
    const final = envelope(sessionId, 2, "observation", { observation: finalObservation }, observed.eventHash);
    const finalStored = await post(bridge, token, final);
    assert.equal(finalStored.status, 200);

    const gap = envelope(sessionId, 4, "session.stopped", {
      stoppedAt: new Date().toISOString(),
      complete: true,
      reason: "USER_STOPPED"
    }, final.eventHash);
    const gapResponse = await post(bridge, token, gap);
    assert.equal(gapResponse.status, 409);
    assert.equal((await gapResponse.json()).code, "BRIDGE_SEQUENCE_GAP");

    const stop = envelope(sessionId, 3, "session.stopped", {
      stoppedAt: new Date().toISOString(),
      complete: true,
      reason: "USER_STOPPED"
    }, final.eventHash);
    const stopped = await post(bridge, token, stop);
    assert.equal(stopped.status, 200);
    assert.equal((await stopped.json()).sequence, 3);

    const eventLines = fs.readFileSync(bridge.eventsPath, "utf8").trim().split("\n").map(JSON.parse);
    assert.equal(eventLines.length, 4);
    assert.deepEqual(eventLines.map((record) => record.seq), [0, 1, 2, 3]);
    assert.equal(eventLines[1].payload.sourceTrust, policy.SOURCE_TRUST);
    assert.match(eventLines[1].payload.snapshotFile, /^snapshots\/000001-/);
    assert.equal(Object.hasOwn(eventLines[1].payload, "sanitizedHtml"), false);
    const snapshotPath = path.join(bridge.sessionDirectory, ...eventLines[1].payload.snapshotFile.split("/"));
    const snapshotEvidence = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
    assert.equal(snapshotEvidence.observation.sanitizedHtml.includes("fixture page"), true);
    assert.equal(snapshotEvidence.eventHash, observed.eventHash);

    const state = JSON.parse(fs.readFileSync(bridge.statePath, "utf8"));
    assert.equal(state.captureComplete, true);
    assert.equal(state.bridgeComplete, true);
    assert.equal(state.transportReady, true);
    assert.equal(state.snapshotCount, 2);
    assert.equal(state.finalSnapshotComplete, true);
    assert.equal(stdout.text().split("\n").filter(Boolean).length, 5);
    assert.equal(stderr.text(), "");
    const validation = validateSession(bridge.sessionDirectory);
    assert.equal(validation.status, "passed");
    assert.equal(validation.summary.transportReady, true);

    const persistedText = fs.readdirSync(bridge.sessionDirectory, { recursive: true })
      .filter((name) => typeof name === "string")
      .map((name) => {
        const fullPath = path.join(bridge.sessionDirectory, name);
        return fs.statSync(fullPath).isFile() ? fs.readFileSync(fullPath, "utf8") : "";
      }).join("\n");
    assert.equal(persistedText.includes(token), false);

    fs.unlinkSync(snapshotPath);
    const missingSnapshot = validateSession(bridge.sessionDirectory);
    assert.equal(missingSnapshot.status, "failed");
    assert.equal(missingSnapshot.errors.some((error) => error.includes("could not be parsed")), true);
  } finally {
    await bridge.close();
    removeTree(bridge.sessionDirectory);
  }
});

test("bridge persists and validates a complete sensitive GraphQL development exchange", async () => {
  const token = "x".repeat(43);
  const bridge = await createObserverBridge({
    outputRoot: liveRoot,
    port: 0,
    token,
    json: true,
    stdout: captureStream(),
    stderr: captureStream()
  });
  try {
    const sessionId = randomUUID();
    const start = envelope(sessionId, 0, "session.started", {
      startedAt: new Date().toISOString(),
      startUrl: "https://example.com/records",
      tabId: 41,
      windowId: 7,
      extensionVersion: "0.3.1",
      networkCapture: networkCapturePolicy()
    }, null);
    assert.equal((await post(bridge, token, start)).status, 200);

    const rawRequest = JSON.stringify({
      operationName: "DevelopmentQuery",
      query: "query DevelopmentQuery($id: ID!) { account(id: $id) { id } }",
      variables: { id: "private-account-id" }
    });
    const requestNetwork = {
      schemaVersion: policy.PROTOCOL_VERSION,
      contractVersion: policy.CONTRACT_VERSION,
      sourceTrust: policy.NETWORK_SOURCE_TRUST,
      kind: "graphql-request",
      requestId: "request-1",
      observedAt: new Date().toISOString(),
      tabId: 41,
      url: "https://example.com/graphql?source=account",
      endpoint: "https://example.com/graphql",
      method: "POST",
      resourceType: "Fetch",
      headers: {
        Authorization: "Bearer retained-development-token",
        "Content-Type": "application/json"
      },
      operationNames: ["DevelopmentQuery"],
      body: networkBody(rawRequest)
    };
    const request = envelope(
      sessionId,
      1,
      "network.graphql.request",
      { network: requestNetwork },
      start.eventHash
    );
    assert.equal((await post(bridge, token, request)).status, 200);

    const rawResponse = JSON.stringify({ data: { account: { id: "private-account-id" } } });
    const responseNetwork = {
      schemaVersion: policy.PROTOCOL_VERSION,
      contractVersion: policy.CONTRACT_VERSION,
      sourceTrust: policy.NETWORK_SOURCE_TRUST,
      kind: "graphql-response",
      requestId: "request-1",
      observedAt: new Date().toISOString(),
      tabId: 41,
      url: "https://example.com/graphql?source=account",
      endpoint: "https://example.com/graphql",
      status: 200,
      statusText: "OK",
      mimeType: "application/json",
      protocol: "h2",
      fromDiskCache: false,
      fromServiceWorker: false,
      headers: { "Content-Type": "application/json", "X-Trace": "trace-1" },
      timing: { requestTime: 100, receiveHeadersEnd: 25.5 },
      encodedDataLength: 128,
      body: networkBody(rawResponse)
    };
    const response = envelope(
      sessionId,
      2,
      "network.graphql.response",
      { network: responseNetwork },
      request.eventHash
    );
    assert.equal((await post(bridge, token, response)).status, 200);

    const finalObservation = snapshot();
    finalObservation.reason = "final";
    const final = envelope(sessionId, 3, "observation", { observation: finalObservation }, response.eventHash);
    assert.equal((await post(bridge, token, final)).status, 200);
    const stop = envelope(sessionId, 4, "session.stopped", {
      stoppedAt: new Date().toISOString(),
      complete: true,
      reason: "USER_STOPPED"
    }, final.eventHash);
    assert.equal((await post(bridge, token, stop)).status, 200);

    const records = fs.readFileSync(bridge.eventsPath, "utf8").trim().split("\n").map(JSON.parse);
    assert.equal(records[1].payload.network.body.body, rawRequest);
    assert.equal(records[1].payload.network.headers.Authorization, "Bearer retained-development-token");
    assert.equal(records[2].payload.network.body.body, rawResponse);
    const state = JSON.parse(fs.readFileSync(bridge.statePath, "utf8"));
    assert.equal(state.networkRequestCount, 1);
    assert.equal(state.networkResponseCount, 1);
    assert.equal(state.networkFailureCount, 0);
    assert.equal(state.incompleteNetworkEvents, 0);
    assert.equal(state.transportReady, true);
    const validation = validateSession(bridge.sessionDirectory);
    assert.equal(validation.status, "passed");
    assert.equal(validation.summary.networkRequests, 1);
    assert.equal(validation.summary.networkResponses, 1);
    assert.equal(validation.summary.networkBodyBytes, requestNetwork.body.byteLength + responseNetwork.body.byteLength);
  } finally {
    await bridge.close();
    removeTree(bridge.sessionDirectory);
  }
});

test("incomplete GraphQL body evidence prevents transport readiness", async () => {
  const token = "y".repeat(43);
  const bridge = await createObserverBridge({
    outputRoot: liveRoot,
    port: 0,
    token,
    json: true,
    stdout: captureStream(),
    stderr: captureStream()
  });
  try {
    const sessionId = randomUUID();
    const start = envelope(sessionId, 0, "session.started", {
      startedAt: new Date().toISOString(),
      startUrl: "https://example.com/records",
      tabId: 41,
      windowId: 7,
      extensionVersion: "0.3.1",
      networkCapture: networkCapturePolicy()
    }, null);
    assert.equal((await post(bridge, token, start)).status, 200);
    const requestNetwork = {
      schemaVersion: policy.PROTOCOL_VERSION,
      contractVersion: policy.CONTRACT_VERSION,
      sourceTrust: policy.NETWORK_SOURCE_TRUST,
      kind: "graphql-request",
      requestId: "request-large",
      observedAt: new Date().toISOString(),
      tabId: 41,
      url: "https://example.com/graphql",
      endpoint: "https://example.com/graphql",
      method: "POST",
      resourceType: "Fetch",
      headers: { "Content-Type": "application/json" },
      operationNames: ["LargeDevelopmentQuery"],
      body: {
        base64Encoded: false,
        body: null,
        byteLength: policy.MAX_NETWORK_REQUEST_BODY_BYTES + 1,
        complete: false,
        omissionReason: "BODY_LIMIT_EXCEEDED",
        sha256: null
      }
    };
    const request = envelope(sessionId, 1, "network.graphql.request", { network: requestNetwork }, start.eventHash);
    assert.equal((await post(bridge, token, request)).status, 200);
    const finalObservation = snapshot();
    finalObservation.reason = "final";
    const final = envelope(sessionId, 2, "observation", { observation: finalObservation }, request.eventHash);
    assert.equal((await post(bridge, token, final)).status, 200);
    const stop = envelope(sessionId, 3, "session.stopped", {
      stoppedAt: new Date().toISOString(),
      complete: true,
      reason: "USER_STOPPED"
    }, final.eventHash);
    const stopped = await post(bridge, token, stop);
    assert.equal(stopped.status, 200);
    assert.equal((await stopped.json()).transportReady, false);
    const state = JSON.parse(fs.readFileSync(bridge.statePath, "utf8"));
    assert.equal(state.incompleteNetworkEvents, 1);
    assert.equal(state.transportReady, false);
    assert.equal(validateSession(bridge.sessionDirectory).status, "failed");
  } finally {
    await bridge.close();
    removeTree(bridge.sessionDirectory);
  }
});

test("bridge rejects evidence from a different separately allowed page origin", async () => {
  const token = "o".repeat(43);
  const bridge = await createObserverBridge({
    outputRoot: liveRoot,
    port: 0,
    token,
    json: true,
    stdout: captureStream(),
    stderr: captureStream()
  });
  try {
    const sessionId = randomUUID();
    const start = envelope(sessionId, 0, "session.started", {
      startedAt: new Date().toISOString(),
      startUrl: "https://example.com/records",
      tabId: 41,
      windowId: 7,
      extensionVersion: "0.3.1",
      networkCapture: networkCapturePolicy()
    }, null);
    assert.equal((await post(bridge, token, start)).status, 200);
    const changedOrigin = envelope(
      sessionId,
      1,
      "observation",
      { observation: snapshot("https://second.example/records") },
      start.eventHash
    );
    const rejected = await post(bridge, token, changedOrigin);
    assert.equal(rejected.status, 409);
    assert.equal((await rejected.json()).code, "BRIDGE_PAGE_ORIGIN_CHANGED");
  } finally {
    await bridge.close();
    removeTree(bridge.sessionDirectory);
  }
});

test("bridge rejects wrong tokens, origins, methods, paths and malformed preflight", async () => {
  const bridge = await createObserverBridge({
    outputRoot: liveRoot,
    port: 0,
    token: "b".repeat(43),
    json: true,
    stdout: captureStream(),
    stderr: captureStream()
  });
  try {
    const sessionId = randomUUID();
    const start = envelope(sessionId, 0, "session.started", {
      startedAt: new Date().toISOString(),
      startUrl: "https://example.com/records",
      tabId: 1,
      windowId: 1,
      extensionVersion: "0.3.1",
      networkCapture: networkCapturePolicy()
    }, null);
    const beforeConnect = await post(bridge, "b".repeat(43), start, { autoConnect: false });
    assert.equal(beforeConnect.status, 409);
    assert.equal((await beforeConnect.json()).code, "BRIDGE_CONNECT_REQUIRED");
    assert.equal((await post(bridge, "wrong-token".padEnd(43, "x"), start)).status, 401);
    assert.equal((await post(bridge, "b".repeat(43), start, { origin: "https://example.com" })).status, 403);
    assert.equal((await post(bridge, "b".repeat(43), start, { origin: null })).status, 403);
    assert.equal((await fetch(`http://127.0.0.1:${bridge.port}/wrong`, { method: "POST" })).status, 404);
    assert.equal((await fetch(`http://127.0.0.1:${bridge.port}/v1/ingest`, { method: "GET" })).status, 405);

    const preflight = await fetch(`http://127.0.0.1:${bridge.port}/v1/ingest`, {
      method: "OPTIONS",
      headers: {
        "Origin": "chrome-extension://abcdefghijklmnopabcdefghijklmnop",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type, x-model-observer-auth, x-model-observer-protocol"
      }
    });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get("access-control-allow-origin"), "chrome-extension://abcdefghijklmnopabcdefghijklmnop");
  } finally {
    await bridge.close();
    removeTree(bridge.sessionDirectory);
  }
});

test("bridge refuses false completeness without a final stable snapshot", async () => {
  const token = "c".repeat(43);
  const bridge = await createObserverBridge({
    outputRoot: liveRoot,
    port: 0,
    token,
    json: true,
    stdout: captureStream(),
    stderr: captureStream()
  });
  try {
    const sessionId = randomUUID();
    const start = envelope(sessionId, 0, "session.started", {
      startedAt: new Date().toISOString(),
      startUrl: "https://example.com/records",
      tabId: 1,
      windowId: 1,
      extensionVersion: "0.3.1",
      networkCapture: networkCapturePolicy()
    }, null);
    assert.equal((await post(bridge, token, start)).status, 200);
    const falseStop = envelope(sessionId, 1, "session.stopped", {
      stoppedAt: new Date().toISOString(),
      complete: true,
      reason: "USER_STOPPED"
    }, start.eventHash);
    const response = await post(bridge, token, falseStop);
    assert.equal(response.status, 409);
    assert.equal((await response.json()).code, "BRIDGE_FINAL_SNAPSHOT_REQUIRED");
    const state = JSON.parse(fs.readFileSync(bridge.statePath, "utf8"));
    assert.equal(state.captureComplete, false);
    assert.equal(state.bridgeComplete, false);
    assert.equal(state.transportReady, false);
  } finally {
    await bridge.close();
    removeTree(bridge.sessionDirectory);
  }
});

test("terminal acknowledgment exposes earlier truncation as transport-incomplete", async () => {
  const token = "t".repeat(43);
  const bridge = await createObserverBridge({
    outputRoot: liveRoot,
    port: 0,
    token,
    json: true,
    stdout: captureStream(),
    stderr: captureStream()
  });
  try {
    const sessionId = randomUUID();
    const start = envelope(sessionId, 0, "session.started", {
      startedAt: new Date().toISOString(),
      startUrl: "https://example.com/records",
      tabId: 1,
      windowId: 1,
      extensionVersion: "0.3.1",
      networkCapture: networkCapturePolicy()
    }, null);
    assert.equal((await post(bridge, token, start)).status, 200);
    const truncatedObservation = snapshot();
    truncatedObservation.truncated = true;
    const truncated = envelope(sessionId, 1, "observation", { observation: truncatedObservation }, start.eventHash);
    assert.equal((await post(bridge, token, truncated)).status, 200);
    const finalObservation = snapshot();
    finalObservation.reason = "final";
    finalObservation.observationId = randomUUID();
    const final = envelope(sessionId, 2, "observation", { observation: finalObservation }, truncated.eventHash);
    assert.equal((await post(bridge, token, final)).status, 200);
    const stop = envelope(sessionId, 3, "session.stopped", {
      stoppedAt: new Date().toISOString(),
      complete: true,
      reason: "USER_STOPPED"
    }, final.eventHash);
    const stopped = await post(bridge, token, stop);
    assert.equal(stopped.status, 200);
    const stoppedPayload = await stopped.json();
    assert.equal(stoppedPayload.captureComplete, true);
    assert.equal(stoppedPayload.bridgeComplete, true);
    assert.equal(stoppedPayload.transportReady, false);
    assert.equal(stoppedPayload.status, "incomplete");
    const state = JSON.parse(fs.readFileSync(bridge.statePath, "utf8"));
    assert.equal(state.truncatedSnapshots, 1);
    assert.equal(state.transportReady, false);
  } finally {
    await bridge.close();
    removeTree(bridge.sessionDirectory);
  }
});

test("bridge retries reconcile snapshot-publish and post-journal failures without duplicate events", async () => {
  for (const targetFailpoint of ["after-snapshot-publish", "after-journal-sync", "before-state-persist"]) {
    let injected = false;
    const token = targetFailpoint[0].repeat(43);
    const bridge = await createObserverBridge({
      outputRoot: liveRoot,
      port: 0,
      token,
      json: true,
      stdout: captureStream(),
      stderr: captureStream(),
      failpoint(name, context) {
        if (!injected && name === targetFailpoint && context.envelope.seq === 1) {
          injected = true;
          throw new Error(`injected ${targetFailpoint}`);
        }
      }
    });
    try {
      const sessionId = randomUUID();
      const start = envelope(sessionId, 0, "session.started", {
        startedAt: new Date().toISOString(),
        startUrl: "https://example.com/records",
        tabId: 1,
        windowId: 1,
        extensionVersion: "0.3.1",
        networkCapture: networkCapturePolicy()
      }, null);
      assert.equal((await post(bridge, token, start)).status, 200);
      const observed = envelope(sessionId, 1, "observation", { observation: snapshot() }, start.eventHash);
      const failed = await post(bridge, token, observed);
      assert.equal(failed.status, 500, targetFailpoint);
      const retried = await post(bridge, token, observed);
      assert.equal(retried.status, 200, targetFailpoint);
      const retriedPayload = await retried.json();
      assert.equal(retriedPayload.sequence, 1);
      const aborted = envelope(sessionId, 2, "session.aborted", {
        stoppedAt: new Date().toISOString(),
        complete: false,
        reason: "TEST_ABORTED"
      }, observed.eventHash);
      assert.equal((await post(bridge, token, aborted)).status, 200);
      const eventLines = fs.readFileSync(bridge.eventsPath, "utf8").trim().split("\n").map(JSON.parse);
      assert.deepEqual(eventLines.map((record) => record.seq), [0, 1, 2], targetFailpoint);
      const state = JSON.parse(fs.readFileSync(bridge.statePath, "utf8"));
      assert.equal(state.lastSequence, 2, targetFailpoint);
      assert.equal(state.eventCount, 3, targetFailpoint);
    } finally {
      await bridge.close();
      removeTree(bridge.sessionDirectory);
    }
  }
});

test("bridge reserves its final event slot for a terminal abort", async () => {
  const token = "r".repeat(43);
  const bridge = await createObserverBridge({
    outputRoot: liveRoot,
    port: 0,
    token,
    json: true,
    stdout: captureStream(),
    stderr: captureStream(),
    maxEvents: 3
  });
  try {
    const sessionId = randomUUID();
    const start = envelope(sessionId, 0, "session.started", {
      startedAt: new Date().toISOString(),
      startUrl: "https://example.com/records",
      tabId: 1,
      windowId: 1,
      extensionVersion: "0.3.1",
      networkCapture: networkCapturePolicy()
    }, null);
    assert.equal((await post(bridge, token, start)).status, 200);
    const observed = envelope(sessionId, 1, "observation", { observation: snapshot() }, start.eventHash);
    assert.equal((await post(bridge, token, observed)).status, 200);
    const overLimit = envelope(sessionId, 2, "observation", { observation: snapshot() }, observed.eventHash);
    const rejected = await post(bridge, token, overLimit);
    assert.equal(rejected.status, 507);
    assert.equal((await rejected.json()).code, "BRIDGE_EVENT_LIMIT_REACHED");
    const aborted = envelope(sessionId, 2, "session.aborted", {
      stoppedAt: new Date().toISOString(),
      complete: false,
      reason: "BRIDGE_EVENT_LIMIT_REACHED"
    }, observed.eventHash);
    assert.equal((await post(bridge, token, aborted)).status, 200);
    const lines = fs.readFileSync(bridge.eventsPath, "utf8").trim().split("\n").map(JSON.parse);
    assert.deepEqual(lines.map((record) => record.seq), [0, 1, 2]);
    assert.equal(lines.at(-1).eventType, "session.aborted");
  } finally {
    await bridge.close();
    removeTree(bridge.sessionDirectory);
  }
});

test("validator rejects recomputed malformed records, payloads, snapshots and state", async () => {
  const token = "v".repeat(43);
  const bridge = await createObserverBridge({
    outputRoot: liveRoot,
    port: 0,
    token,
    json: true,
    stdout: captureStream(),
    stderr: captureStream()
  });
  try {
    const sessionId = randomUUID();
    const start = envelope(sessionId, 0, "session.started", {
      startedAt: new Date().toISOString(),
      startUrl: "https://example.com/records",
      tabId: 1,
      windowId: 1,
      extensionVersion: "0.3.1",
      networkCapture: networkCapturePolicy()
    }, null);
    assert.equal((await post(bridge, token, start)).status, 200);
    const finalObservation = snapshot();
    finalObservation.reason = "final";
    const final = envelope(sessionId, 1, "observation", { observation: finalObservation }, start.eventHash);
    assert.equal((await post(bridge, token, final)).status, 200);
    const stop = envelope(sessionId, 2, "session.stopped", {
      stoppedAt: new Date().toISOString(),
      complete: true,
      reason: "USER_STOPPED"
    }, final.eventHash);
    assert.equal((await post(bridge, token, stop)).status, 200);
    await bridge.close();
    assert.equal(validateSession(bridge.sessionDirectory).status, "passed");

    const cases = [
      {
        name: "extra-start-token",
        expected: "persisted event contract",
        mutate(directory) {
          rechainSession(directory, (records) => { records[0].payload.connectionToken = "must-not-pass"; });
        }
      },
      {
        name: "unknown-event-type",
        expected: "persisted event contract",
        mutate(directory) {
          rechainSession(directory, (records) => { records[1].eventType = "observation.unknown"; });
        }
      },
      {
        name: "invalid-event-id",
        expected: "persisted event contract",
        mutate(directory) {
          rechainSession(directory, (records) => { records[0].eventId = "not-a-uuid"; });
        }
      },
      {
        name: "invalid-event-time",
        expected: "persisted event contract",
        mutate(directory) {
          rechainSession(directory, (records) => { records[0].observedAt = "not-a-time"; });
        }
      },
      {
        name: "wrong-schema-contract",
        expected: "persisted event contract",
        mutate(directory) {
          rechainSession(directory, (records) => {
            records[0].schemaVersion = 99;
            records[0].contractVersion = "wrong";
          });
        }
      },
      {
        name: "extra-stop-token",
        expected: "persisted event contract",
        mutate(directory) {
          rechainSession(directory, (records) => { records.at(-1).payload.token = "must-not-pass"; });
        }
      },
      {
        name: "extra-snapshot-token",
        expected: "invalid schema",
        mutate(directory) {
          const records = fs.readFileSync(path.join(directory, "events.ndjson"), "utf8")
            .trim().split("\n").map(JSON.parse);
          const snapshotPath = path.join(directory, ...records[1].payload.snapshotFile.split("/"));
          const evidence = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
          evidence.connectionToken = "must-not-pass";
          writeJson(snapshotPath, evidence);
        }
      },
      {
        name: "extra-state-token",
        expected: "bridge-state has an invalid schema",
        mutate(directory) {
          const statePath = path.join(directory, "bridge-state.json");
          const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
          state.connectionToken = "must-not-pass";
          writeJson(statePath, state);
        }
      },
      {
        name: "null-state",
        expected: "bridge-state has an invalid schema",
        mutate(directory) {
          writeJson(path.join(directory, "bridge-state.json"), null);
        }
      },
      {
        name: "noncanonical-event-line",
        expected: "canonical JSON form",
        mutate(directory) {
          const eventsPath = path.join(directory, "events.ndjson");
          const text = fs.readFileSync(eventsPath, "utf8");
          fs.writeFileSync(eventsPath, ` ${text}`, "utf8");
        }
      },
      {
        name: "empty-event-line",
        expected: "empty record line",
        mutate(directory) {
          const eventsPath = path.join(directory, "events.ndjson");
          const text = fs.readFileSync(eventsPath, "utf8");
          fs.writeFileSync(eventsPath, text.replace("\n", "\n\n"), "utf8");
        }
      },
      {
        name: "duplicate-state-key",
        expected: "canonical JSON form",
        mutate(directory) {
          const statePath = path.join(directory, "bridge-state.json");
          const text = fs.readFileSync(statePath, "utf8");
          fs.writeFileSync(statePath, text.replace(/^\{/, '{"schemaVersion":1,'), "utf8");
        }
      }
    ];

    for (const scenario of cases) {
      const candidate = `${bridge.sessionDirectory}-${scenario.name}`;
      fs.cpSync(bridge.sessionDirectory, candidate, { recursive: true, errorOnExist: true });
      try {
        scenario.mutate(candidate);
        const report = validateSession(candidate);
        assert.equal(report.status, "failed", scenario.name);
        assert.equal(report.summary.transportReady, false, scenario.name);
        assert.equal(report.errors.some((error) => error.includes(scenario.expected)), true, scenario.name);
      } finally {
        removeTree(candidate);
      }
    }
  } finally {
    await bridge.close();
    removeTree(bridge.sessionDirectory);
  }
});

test("CLI help, version and missing-output usage exits are stable", () => {
  const help = spawnSync(process.execPath, [bridgeScript, "--help"], { encoding: "utf8" });
  assert.equal(help.status, 0);
  assert.match(help.stdout, /--output-root/);
  assert.equal(help.stderr, "");

  const version = spawnSync(process.execPath, [bridgeScript, "--version"], { encoding: "utf8" });
  assert.equal(version.status, 0);
  assert.equal(version.stdout.trim(), "0.3.1");

  const missing = spawnSync(process.execPath, [bridgeScript], { encoding: "utf8" });
  assert.equal(missing.status, 2);
  assert.equal(missing.stdout, "");
  assert.match(missing.stderr, /--output-root is required/);
  const unapprovedRoot = spawnSync(process.execPath, [
    bridgeScript,
    "--output-root", path.join(testRoot, "unapproved-live-root")
  ], { encoding: "utf8" });
  assert.equal(unapprovedRoot.status, 1);
  assert.match(unapprovedRoot.stderr, /Output root must be/);
  assert.equal(fs.existsSync(path.join(testRoot, "unapproved-live-root")), false);

  const validatorHelp = spawnSync(process.execPath, [validatorScript, "--help"], { encoding: "utf8" });
  assert.equal(validatorHelp.status, 0);
  assert.match(validatorHelp.stdout, /--session/);
  const validatorMissing = spawnSync(process.execPath, [validatorScript], { encoding: "utf8" });
  assert.equal(validatorMissing.status, 2);
  assert.match(validatorMissing.stderr, /--session is required/);
});
