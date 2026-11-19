#!/usr/bin/env node

import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import {
  access,
  link,
  mkdir,
  open,
  readFile,
  realpath,
  rename,
  unlink,
  writeFile
} from "node:fs/promises";
import http from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

const require = createRequire(import.meta.url);
const policy = require("../extension/observer-policy.js");
const VERSION = "0.3.1";
const DEFAULT_PORT = policy.CONFIG.bridgePort;
const MAX_EVENTS = 500;
const MAX_SESSION_BYTES = 256 * 1024 * 1024;
const MAX_NETWORK_SESSION_BYTES = policy.MAX_NETWORK_SESSION_BODY_BYTES;
const AUTH_HEADER = "x-model-observer-auth";
const PROTOCOL_HEADER = "x-model-observer-protocol";
const ALLOWED_REQUEST_HEADERS = "content-type, x-model-observer-auth, x-model-observer-protocol";
const EXTENSION_ORIGIN_PATTERN = /^chrome-extension:\/\/[a-p]{32}$/;
const EVENT_TYPES = new Set([
  "observation",
  "network.graphql.failure",
  "network.graphql.request",
  "network.graphql.response",
  "session.aborted",
  "session.started",
  "session.stopped"
]);
const TASK_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AUTHORIZED_OUTPUT_ROOT = path.join(TASK_ROOT, "live");

class ProtocolError extends Error {
  constructor(code, status = 400) {
    super(code);
    this.name = "ProtocolError";
    this.code = code;
    this.status = status;
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasExactKeys(value, expected) {
  if (!isPlainObject(value)) {
    return false;
  }
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  return actual.length === wanted.length && actual.every((key, index) => key === wanted[index]);
}

function validUuid(value) {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function validIsoTimestamp(value) {
  if (typeof value !== "string") {
    return false;
  }
  const parsed = new Date(value);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString() === value;
}

function sha256(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function samePath(left, right) {
  const normalize = (value) => process.platform === "win32"
    ? path.normalize(value).toLowerCase()
    : path.normalize(value);
  return normalize(left) === normalize(right);
}

function hmacSha256(secret, value) {
  return createHmac("sha256", secret).update(value, "utf8").digest("hex");
}

function safeHexEqual(expected, provided) {
  if (typeof provided !== "string" || !/^[a-f0-9]{64}$/.test(provided)) {
    return false;
  }
  const expectedBytes = Buffer.from(expected, "utf8");
  const providedBytes = Buffer.from(provided, "utf8");
  return expectedBytes.length === providedBytes.length && timingSafeEqual(expectedBytes, providedBytes);
}

function validRemoteAddress(value) {
  return value === "127.0.0.1" || value === "::1" || value === "::ffff:127.0.0.1";
}

function validExtensionOrigin(value) {
  return typeof value === "string" && EXTENSION_ORIGIN_PATTERN.test(value);
}

function corsHeaders(origin) {
  return validExtensionOrigin(origin)
    ? {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": ALLOWED_REQUEST_HEADERS,
        "Access-Control-Max-Age": "600",
        "Vary": "Origin"
      }
    : {};
}

function writeJsonResponse(response, status, payload, origin = null) {
  const body = `${JSON.stringify(payload)}\n`;
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body),
    ...corsHeaders(origin)
  });
  response.end(body);
}

async function readJsonBody(request) {
  const contentEncoding = request.headers["content-encoding"];
  if (contentEncoding && contentEncoding.toLowerCase() !== "identity") {
    throw new ProtocolError("BRIDGE_CONTENT_ENCODING_REJECTED", 415);
  }
  const contentType = request.headers["content-type"] || "";
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(contentType)) {
    throw new ProtocolError("BRIDGE_CONTENT_TYPE_REJECTED", 415);
  }
  const declaredLength = request.headers["content-length"];
  if (declaredLength !== undefined) {
    const parsedLength = Number(declaredLength);
    if (!Number.isInteger(parsedLength) || parsedLength < 1 || parsedLength > policy.MAX_REQUEST_BYTES) {
      throw new ProtocolError("BRIDGE_BODY_TOO_LARGE", 413);
    }
  }

  const chunks = [];
  let totalBytes = 0;
  for await (const chunk of request) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += bytes.length;
    if (totalBytes > policy.MAX_REQUEST_BYTES) {
      throw new ProtocolError("BRIDGE_BODY_TOO_LARGE", 413);
    }
    chunks.push(bytes);
  }
  if (totalBytes === 0) {
    throw new ProtocolError("BRIDGE_EMPTY_BODY");
  }
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks));
  } catch (_error) {
    throw new ProtocolError("BRIDGE_INVALID_UTF8");
  }
  try {
    return JSON.parse(text);
  } catch (_error) {
    throw new ProtocolError("BRIDGE_INVALID_JSON");
  }
}

function validateStartPayload(value) {
  return hasExactKeys(value, ["extensionVersion", "networkCapture", "startedAt", "startUrl", "tabId", "windowId"]) &&
    typeof value.extensionVersion === "string" &&
    /^\d+\.\d+\.\d+$/.test(value.extensionVersion) &&
    validIsoTimestamp(value.startedAt) &&
    policy.normalizeObservedUrl(value.startUrl) === value.startUrl &&
    Number.isInteger(value.tabId) && value.tabId >= 0 &&
    Number.isInteger(value.windowId) &&
    validateNetworkCapturePolicy(value.networkCapture);
}

function validateNetworkCapturePolicy(value) {
  return hasExactKeys(value, [
    "enabled",
    "graphqlEndpointPaths",
    "maximumPendingRequests",
    "maximumRequestBodyBytes",
    "maximumResponseBodyBytes",
    "maximumSessionBodyBytes"
  ]) && typeof value.enabled === "boolean" &&
    Array.isArray(value.graphqlEndpointPaths) && value.graphqlEndpointPaths.length <= 32 &&
    (!value.enabled || value.graphqlEndpointPaths.length > 0) &&
    value.graphqlEndpointPaths.every((pathValue) =>
      typeof pathValue === "string" && pathValue.startsWith("/") && pathValue.length <= 2048 &&
      !pathValue.includes("?") && !pathValue.includes("#")
    ) && new Set(value.graphqlEndpointPaths).size === value.graphqlEndpointPaths.length &&
    Number.isInteger(value.maximumPendingRequests) && value.maximumPendingRequests >= 1 && value.maximumPendingRequests <= 256 &&
    Number.isInteger(value.maximumRequestBodyBytes) && value.maximumRequestBodyBytes >= 1 &&
    value.maximumRequestBodyBytes <= policy.MAX_NETWORK_REQUEST_BODY_BYTES &&
    Number.isInteger(value.maximumResponseBodyBytes) && value.maximumResponseBodyBytes >= 1 &&
    value.maximumResponseBodyBytes <= policy.MAX_NETWORK_RESPONSE_BODY_BYTES &&
    Number.isInteger(value.maximumSessionBodyBytes) &&
    value.maximumSessionBodyBytes >= Math.max(value.maximumRequestBodyBytes, value.maximumResponseBodyBytes) &&
    value.maximumSessionBodyBytes <= policy.MAX_NETWORK_SESSION_BODY_BYTES;
}

function validateStopPayload(value) {
  return hasExactKeys(value, ["complete", "reason", "stoppedAt"]) &&
    typeof value.complete === "boolean" &&
    typeof value.reason === "string" &&
    /^[A-Z0-9_]{1,100}$/.test(value.reason) &&
    validIsoTimestamp(value.stoppedAt);
}

function validatePayload(eventType, payload) {
  if (eventType === "session.started") {
    return validateStartPayload(payload);
  }
  if (eventType === "session.stopped" || eventType === "session.aborted") {
    return validateStopPayload(payload) &&
      (eventType === "session.stopped" ? payload.complete === true : payload.complete === false);
  }
  if (eventType === "observation") {
    return hasExactKeys(payload, ["observation"]) && policy.validateObservation(payload.observation);
  }
  if (eventType.startsWith("network.graphql.")) {
    const expectedKind = eventType.slice("network.".length).replace(".", "-");
    return hasExactKeys(payload, ["network"]) &&
      policy.validateNetworkEvidence(payload.network) && payload.network.kind === expectedKind;
  }
  return false;
}

function validateEnvelope(value) {
  if (!hasExactKeys(value, [
    "contractVersion",
    "eventHash",
    "eventId",
    "eventType",
    "observedAt",
    "payload",
    "payloadHash",
    "previousEventHash",
    "schemaVersion",
    "seq",
    "sessionId"
  ])) {
    throw new ProtocolError("BRIDGE_INVALID_ENVELOPE");
  }
  if (value.schemaVersion !== policy.PROTOCOL_VERSION ||
      value.contractVersion !== policy.CONTRACT_VERSION ||
      !validUuid(value.sessionId) ||
      !validUuid(value.eventId) ||
      !validIsoTimestamp(value.observedAt) ||
      !Number.isInteger(value.seq) || value.seq < 0 || value.seq > MAX_EVENTS ||
      !EVENT_TYPES.has(value.eventType) ||
      typeof value.payloadHash !== "string" || !/^[a-f0-9]{64}$/.test(value.payloadHash) ||
      (value.previousEventHash !== null && (typeof value.previousEventHash !== "string" || !/^[a-f0-9]{64}$/.test(value.previousEventHash))) ||
      typeof value.eventHash !== "string" || !/^[a-f0-9]{64}$/.test(value.eventHash) ||
      !validatePayload(value.eventType, value.payload)) {
    throw new ProtocolError("BRIDGE_INVALID_ENVELOPE");
  }
  const payloadHash = sha256(policy.canonicalStringify(value.payload));
  if (payloadHash !== value.payloadHash) {
    throw new ProtocolError("BRIDGE_PAYLOAD_HASH_MISMATCH");
  }
  const core = {
    schemaVersion: value.schemaVersion,
    contractVersion: value.contractVersion,
    sessionId: value.sessionId,
    seq: value.seq,
    eventId: value.eventId,
    observedAt: value.observedAt,
    eventType: value.eventType,
    payloadHash: value.payloadHash,
    previousEventHash: value.previousEventHash
  };
  if (sha256(policy.canonicalStringify(core)) !== value.eventHash) {
    throw new ProtocolError("BRIDGE_EVENT_HASH_MISMATCH");
  }
  if (value.eventType === "observation" && value.payload.observation.kind === "snapshot") {
    const observation = value.payload.observation;
    if (sha256(observation.sanitizedHtml) !== observation.sha256) {
      throw new ProtocolError("BRIDGE_SNAPSHOT_HASH_MISMATCH");
    }
  }
  if (value.eventType.startsWith("network.graphql.") && value.payload.network.body?.complete) {
    const body = value.payload.network.body;
    if (sha256(body.body) !== body.sha256) {
      throw new ProtocolError("BRIDGE_NETWORK_BODY_HASH_MISMATCH");
    }
  }
  return value;
}

async function pathExists(target) {
  try {
    await access(target, fsConstants.F_OK);
    return true;
  } catch (_error) {
    return false;
  }
}

async function atomicPublishNew(target, content) {
  const temporary = `${target}.${randomUUID()}.tmp`;
  const handle = await open(temporary, "wx");
  try {
    await handle.writeFile(content, { encoding: "utf8" });
    await handle.sync();
  } finally {
    await handle.close();
  }
  try {
    await link(temporary, target);
  } finally {
    await unlink(temporary).catch(() => undefined);
  }
}

async function atomicReplace(target, content) {
  const temporary = `${target}.${randomUUID()}.tmp`;
  const handle = await open(temporary, "wx");
  try {
    await handle.writeFile(content, { encoding: "utf8" });
    await handle.sync();
  } finally {
    await handle.close();
  }
  try {
    for (let attempt = 0; ; attempt += 1) {
      try {
        await rename(temporary, target);
        break;
      } catch (error) {
        if (attempt >= 7 || !["EACCES", "EBUSY", "EPERM"].includes(error?.code)) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 10 * (2 ** attempt)));
      }
    }
  } finally {
    await unlink(temporary).catch(() => undefined);
  }
}

function sessionDirectoryName() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `session-${timestamp}-${randomBytes(4).toString("hex")}`;
}

function summarizeObservation(observation, snapshotFile = null) {
  if (observation.kind === "interaction") {
    return { observation };
  }
  return {
    observationId: observation.observationId,
    kind: observation.kind,
    observedAt: observation.observedAt,
    pageKind: observation.pageKind,
    url: observation.url,
    title: observation.title,
    reason: observation.reason,
    sourceTrust: observation.sourceTrust,
    snapshotFile,
    sha256: observation.sha256,
    byteLength: observation.byteLength,
    truncated: observation.truncated,
    redactions: observation.redactions,
    documentState: observation.documentState,
    viewport: observation.viewport
  };
}

function parsePort(rawValue) {
  const port = Number(rawValue);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new ProtocolError("Port must be an integer from 1024 through 65535.", 2);
  }
  return port;
}

function helpText() {
  return `Live Research Observer Bridge v${VERSION}

USAGE
  node bridge/live-observer-bridge.mjs --output-root <directory> [--port <port>] [--json]

EXAMPLES
  node bridge/live-observer-bridge.mjs --output-root live
  node bridge/live-observer-bridge.mjs --output-root live --port ${DEFAULT_PORT} --json

FLAGS
      --output-root <directory>  parent for a new append-only session directory
      --port <port>              loopback port, default ${DEFAULT_PORT}
      --json                     emit one JSON object per line
  -h, --help                     show help
      --version                  show version

EXIT CODES
  0  clean bridge shutdown
  1  runtime or persistence failure
  2  command usage error

The extension connects automatically on the configured loopback port. The internal session secret
is returned only to the pinned extension origin and is never printed or persisted.
`;
}

function emit(stream, jsonMode, payload, humanText) {
  stream.write(jsonMode ? `${JSON.stringify(payload)}\n` : `${humanText}\n`);
}

export async function createObserverBridge(options) {
  const outputRoot = path.resolve(options.outputRoot);
  const requestedPort = options.port ?? DEFAULT_PORT;
  const token = options.token || randomBytes(32).toString("base64url");
  const jsonMode = options.json === true;
  const stdout = options.stdout || process.stdout;
  const stderr = options.stderr || process.stderr;
  const failpoint = typeof options.failpoint === "function" ? options.failpoint : async () => undefined;
  const maxEvents = Number.isInteger(options.maxEvents) && options.maxEvents >= 2
    ? options.maxEvents
    : MAX_EVENTS;
  if (!samePath(outputRoot, AUTHORIZED_OUTPUT_ROOT)) {
    throw new Error(`Output root must be ${AUTHORIZED_OUTPUT_ROOT}.`);
  }
  await mkdir(outputRoot, { recursive: true });
  const canonicalTaskRoot = await realpath(TASK_ROOT);
  const canonicalOutputRoot = await realpath(outputRoot);
  if (!samePath(canonicalOutputRoot, path.join(canonicalTaskRoot, "live"))) {
    throw new Error("Output root resolves outside the task's live directory.");
  }
  const sessionDirectory = path.join(canonicalOutputRoot, sessionDirectoryName());
  const snapshotsDirectory = path.join(sessionDirectory, "snapshots");
  const eventsPath = path.join(sessionDirectory, "events.ndjson");
  const statePath = path.join(sessionDirectory, "bridge-state.json");

  await mkdir(sessionDirectory, { recursive: false });
  await mkdir(snapshotsDirectory, { recursive: false });
  await writeFile(eventsPath, "", { encoding: "utf8", flag: "wx" });
  const eventsHandle = await open(eventsPath, "a");

  const state = {
    schemaVersion: policy.PROTOCOL_VERSION,
    contractVersion: policy.CONTRACT_VERSION,
    bridgeVersion: VERSION,
    bridgeSessionId: randomUUID(),
    extensionSessionId: null,
    status: "waiting-for-extension",
    expectedSequence: 0,
    lastSequence: -1,
    lastEventId: null,
    lastEventHash: null,
    eventCount: 0,
    snapshotCount: 0,
    interactionCount: 0,
    networkRequestCount: 0,
    networkResponseCount: 0,
    networkFailureCount: 0,
    totalNetworkBodyBytes: 0,
    incompleteNetworkEvents: 0,
    totalSnapshotBytes: 0,
    truncatedSnapshots: 0,
    finalSnapshotComplete: false,
    captureComplete: false,
    bridgeComplete: false,
    transportReady: false,
    pinnedExtensionOrigin: null,
    pinnedPageOrigin: null,
    lastEvent: null,
    startedAt: new Date().toISOString(),
    stoppedAt: null
  };
  await atomicReplace(statePath, `${JSON.stringify(state, null, 2)}\n`);

  let boundPort = null;
  let writerQueue = Promise.resolve();
  let closed = false;

  async function persistState(value = state) {
    await atomicReplace(statePath, `${JSON.stringify(value, null, 2)}\n`);
  }

  async function persistEnvelope(envelope) {
    if (envelope.seq === state.lastSequence) {
      if (envelope.eventId === state.lastEventId && envelope.eventHash === state.lastEventHash) {
        await persistState();
        return { duplicate: true, record: state.lastEvent };
      }
      throw new ProtocolError("BRIDGE_SEQUENCE_CONFLICT", 409);
    }
    if (envelope.seq !== state.expectedSequence) {
      throw new ProtocolError(envelope.seq < state.expectedSequence
        ? "BRIDGE_SEQUENCE_REPLAY"
        : "BRIDGE_SEQUENCE_GAP", 409);
    }
    if (state.extensionSessionId === null) {
      if (envelope.seq !== 0 || envelope.eventType !== "session.started" || envelope.previousEventHash !== null) {
        throw new ProtocolError("BRIDGE_START_REQUIRED", 409);
      }
    } else {
      if (envelope.sessionId !== state.extensionSessionId) {
        throw new ProtocolError("BRIDGE_SESSION_CONFLICT", 409);
      }
      if (state.bridgeComplete) {
        throw new ProtocolError("BRIDGE_SESSION_CLOSED", 409);
      }
      if (envelope.previousEventHash !== state.lastEventHash) {
        throw new ProtocolError("BRIDGE_HASH_CHAIN_BROKEN", 409);
      }
    }
    const terminalEvent = envelope.eventType === "session.stopped" || envelope.eventType === "session.aborted";
    if (state.eventCount >= maxEvents || (!terminalEvent && state.eventCount >= maxEvents - 1)) {
      throw new ProtocolError("BRIDGE_EVENT_LIMIT_REACHED", 507);
    }
    if (envelope.eventType === "session.stopped") {
      const previous = state.lastEvent;
      if (!previous ||
          previous.eventType !== "observation" ||
          previous.payload.kind !== "snapshot" ||
          previous.payload.reason !== "final" ||
          previous.payload.truncated === true ||
          previous.payload.documentState.readyState !== "complete") {
        throw new ProtocolError("BRIDGE_FINAL_SNAPSHOT_REQUIRED", 409);
      }
    }

    const nextState = structuredClone(state);
    if (nextState.extensionSessionId === null) {
      nextState.extensionSessionId = envelope.sessionId;
      nextState.pinnedPageOrigin = new URL(envelope.payload.startUrl).origin;
      nextState.status = "observing";
    }
    let persistedPayload = envelope.payload;
    let snapshotFile = null;
    if (envelope.eventType === "observation") {
      const observation = envelope.payload.observation;
      if (new URL(observation.url).origin !== nextState.pinnedPageOrigin) {
        throw new ProtocolError("BRIDGE_PAGE_ORIGIN_CHANGED", 409);
      }
      if (observation.kind === "snapshot") {
        if (nextState.totalSnapshotBytes + observation.byteLength > MAX_SESSION_BYTES) {
          throw new ProtocolError("BRIDGE_BYTE_LIMIT_REACHED", 507);
        }
        const fileName = `${String(envelope.seq).padStart(6, "0")}-${observation.sha256.slice(0, 16)}.snapshot.json`;
        snapshotFile = `snapshots/${fileName}`;
        const snapshotPath = path.join(snapshotsDirectory, fileName);
        const snapshotEvidence = {
          schemaVersion: envelope.schemaVersion,
          contractVersion: envelope.contractVersion,
          sessionId: envelope.sessionId,
          seq: envelope.seq,
          eventId: envelope.eventId,
          payloadHash: envelope.payloadHash,
          eventHash: envelope.eventHash,
          observation
        };
        const snapshotText = `${JSON.stringify(snapshotEvidence, null, 2)}\n`;
        if (await pathExists(snapshotPath)) {
          const existingText = await readFile(snapshotPath, "utf8");
          if (existingText !== snapshotText) {
            throw new ProtocolError("BRIDGE_SNAPSHOT_FILE_COLLISION", 409);
          }
        } else {
          await atomicPublishNew(snapshotPath, snapshotText);
        }
        await failpoint("after-snapshot-publish", { envelope, snapshotPath });
        nextState.snapshotCount += 1;
        nextState.totalSnapshotBytes += observation.byteLength;
        if (observation.truncated) {
          nextState.truncatedSnapshots += 1;
        }
        if (observation.reason === "final") {
          nextState.finalSnapshotComplete = Boolean(
            observation.truncated === false && observation.documentState.readyState === "complete"
          );
        }
        persistedPayload = summarizeObservation(observation, snapshotFile);
      } else {
        nextState.interactionCount += 1;
        persistedPayload = summarizeObservation(observation);
      }
    } else if (envelope.eventType.startsWith("network.graphql.")) {
      const network = envelope.payload.network;
      if (new URL(network.url).origin !== nextState.pinnedPageOrigin) {
        throw new ProtocolError("BRIDGE_PAGE_ORIGIN_CHANGED", 409);
      }
      if (network.kind === "graphql-request") {
        nextState.networkRequestCount += 1;
      } else if (network.kind === "graphql-response") {
        nextState.networkResponseCount += 1;
      } else {
        nextState.networkFailureCount += 1;
      }
      if (network.body) {
        if (network.body.complete) {
          if (nextState.totalNetworkBodyBytes + network.body.byteLength > MAX_NETWORK_SESSION_BYTES) {
            throw new ProtocolError("BRIDGE_NETWORK_BYTE_LIMIT_REACHED", 507);
          }
          nextState.totalNetworkBodyBytes += network.body.byteLength;
        } else {
          nextState.incompleteNetworkEvents += 1;
        }
      } else if (network.kind === "graphql-failure") {
        nextState.incompleteNetworkEvents += 1;
      }
    }

    const record = {
      schemaVersion: envelope.schemaVersion,
      contractVersion: envelope.contractVersion,
      sessionId: envelope.sessionId,
      seq: envelope.seq,
      eventId: envelope.eventId,
      observedAt: envelope.observedAt,
      eventType: envelope.eventType,
      payloadHash: envelope.payloadHash,
      previousEventHash: envelope.previousEventHash,
      eventHash: envelope.eventHash,
      payload: persistedPayload
    };
    await eventsHandle.appendFile(`${JSON.stringify(record)}\n`, { encoding: "utf8" });
    await eventsHandle.sync();

    nextState.lastSequence = envelope.seq;
    nextState.expectedSequence = envelope.seq + 1;
    nextState.lastEventId = envelope.eventId;
    nextState.lastEventHash = envelope.eventHash;
    nextState.eventCount += 1;
    nextState.lastEvent = record;
    if (envelope.eventType === "session.stopped" || envelope.eventType === "session.aborted") {
      nextState.captureComplete = envelope.payload.complete;
      nextState.bridgeComplete = true;
      nextState.transportReady = Boolean(
        envelope.eventType === "session.stopped" &&
        envelope.payload.complete &&
        nextState.snapshotCount > 0 &&
        nextState.truncatedSnapshots === 0 &&
        nextState.incompleteNetworkEvents === 0 &&
        nextState.finalSnapshotComplete
      );
      nextState.status = nextState.transportReady ? "transport-complete" : "incomplete";
      nextState.stoppedAt = envelope.payload.stoppedAt;
    }
    Object.assign(state, nextState);
    await failpoint("after-journal-sync", { envelope, record });
    await failpoint("before-state-persist", { envelope, record });
    await persistState();

    const output = {
      type: "bridge-event",
      sequence: envelope.seq,
      eventType: envelope.eventType,
      pageKind: envelope.eventType === "observation" ? envelope.payload.observation.pageKind : null,
      observationKind: envelope.eventType === "observation" ? envelope.payload.observation.kind : null,
      reason: envelope.eventType === "observation"
        ? envelope.payload.observation.reason || envelope.payload.observation.interactionType
        : envelope.eventType.startsWith("network.graphql.")
          ? envelope.payload.network.kind
          : envelope.payload.reason || null,
      snapshotFile,
      truncated: envelope.eventType === "observation" && envelope.payload.observation.kind === "snapshot"
        ? envelope.payload.observation.truncated
        : null,
      eventHash: envelope.eventHash
    };
    emit(stdout, jsonMode, output, [
      `event ${output.sequence}`,
      output.eventType,
      output.pageKind || "-",
      output.reason || "-",
      output.snapshotFile || "-"
    ].join("  "));
    return { duplicate: false, record };
  }

  const server = http.createServer((request, response) => {
    const requestPath = new URL(request.url || "/", `http://127.0.0.1:${boundPort}`).pathname;
    const operation = writerQueue.then(async () => {
      const origin = request.headers.origin || null;
      if (!validRemoteAddress(request.socket.remoteAddress)) {
        throw new ProtocolError("BRIDGE_LOOPBACK_ONLY", 403);
      }
      if (request.headers.host !== `127.0.0.1:${boundPort}`) {
        throw new ProtocolError("BRIDGE_HOST_REJECTED", 403);
      }
      if (!["/v1/connect", "/v1/ingest"].includes(requestPath)) {
        throw new ProtocolError("BRIDGE_PATH_NOT_FOUND", 404);
      }
      if (request.method === "OPTIONS") {
        if (!validExtensionOrigin(origin) || request.headers["access-control-request-method"] !== "POST") {
          throw new ProtocolError("BRIDGE_PREFLIGHT_REJECTED", 403);
        }
        const requestedHeaders = String(request.headers["access-control-request-headers"] || "")
          .toLowerCase().split(",").map((value) => value.trim()).filter(Boolean);
        const requiredHeaders = requestPath === "/v1/connect"
          ? ["content-type"]
          : ["content-type", AUTH_HEADER, PROTOCOL_HEADER];
        if (!requiredHeaders.every((name) => requestedHeaders.includes(name)) ||
            requestedHeaders.some((name) => !requiredHeaders.includes(name))) {
          throw new ProtocolError("BRIDGE_PREFLIGHT_REJECTED", 403);
        }
        response.writeHead(204, { "Cache-Control": "no-store", ...corsHeaders(origin) });
        response.end();
        return;
      }
      if (request.method !== "POST") {
        throw new ProtocolError("BRIDGE_METHOD_REJECTED", 405);
      }
      if (!validExtensionOrigin(origin)) {
        throw new ProtocolError("BRIDGE_ORIGIN_REJECTED", 403);
      }
      if (state.pinnedExtensionOrigin && origin !== state.pinnedExtensionOrigin) {
        throw new ProtocolError("BRIDGE_ORIGIN_REJECTED", 403);
      }
      if (requestPath === "/v1/connect") {
        const connectRequest = await readJsonBody(request);
        if (!hasExactKeys(connectRequest, ["contractVersion", "extensionVersion", "schemaVersion"]) ||
            connectRequest.schemaVersion !== policy.PROTOCOL_VERSION ||
            connectRequest.contractVersion !== policy.CONTRACT_VERSION ||
            typeof connectRequest.extensionVersion !== "string" ||
            !/^\d+\.\d+\.\d+$/.test(connectRequest.extensionVersion)) {
          throw new ProtocolError("BRIDGE_CONNECT_REJECTED", 400);
        }
        if (!state.pinnedExtensionOrigin) {
          state.pinnedExtensionOrigin = origin;
          await persistState();
        }
        writeJsonResponse(response, 200, {
          ok: true,
          schemaVersion: policy.PROTOCOL_VERSION,
          contractVersion: policy.CONTRACT_VERSION,
          connectionSecret: token
        }, origin);
        return;
      }
      if (!state.pinnedExtensionOrigin) {
        throw new ProtocolError("BRIDGE_CONNECT_REQUIRED", 409);
      }
      if (request.headers[PROTOCOL_HEADER] !== String(policy.PROTOCOL_VERSION)) {
        throw new ProtocolError("BRIDGE_PROTOCOL_REJECTED", 400);
      }
      const rawEnvelope = await readJsonBody(request);
      const expectedAuth = hmacSha256(token, policy.canonicalStringify(rawEnvelope));
      if (!safeHexEqual(expectedAuth, request.headers[AUTH_HEADER])) {
        throw new ProtocolError("BRIDGE_UNAUTHORIZED", 401);
      }
      const envelope = validateEnvelope(rawEnvelope);
      const persisted = await persistEnvelope(envelope);
      const responseCore = {
        ok: true,
        duplicate: persisted.duplicate,
        sequence: envelope.seq,
        eventHash: envelope.eventHash,
        captureComplete: state.captureComplete,
        bridgeComplete: state.bridgeComplete,
        transportReady: state.transportReady,
        status: state.status
      };
      writeJsonResponse(response, 200, {
        ...responseCore,
        responseAuth: hmacSha256(token, policy.canonicalStringify(responseCore))
      }, origin);
    });
    writerQueue = operation.catch(() => undefined);
    operation.catch((error) => {
      const status = error instanceof ProtocolError ? error.status : 500;
      const code = error instanceof ProtocolError ? error.code : "BRIDGE_PERSISTENCE_FAILED";
      const errorCore = { ok: false, code };
      const errorPayload = requestPath === "/v1/connect"
        ? errorCore
        : { ...errorCore, responseAuth: hmacSha256(token, policy.canonicalStringify(errorCore)) };
      writeJsonResponse(response, status, errorPayload, request.headers.origin || null);
      if (!(error instanceof ProtocolError)) {
        emit(stderr, jsonMode, { type: "bridge-error", code }, `Bridge persistence failed (${code}).`);
      }
    });
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen({ host: "127.0.0.1", port: requestedPort, exclusive: true }, resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string" || address.address !== "127.0.0.1") {
    server.close();
    throw new Error("Bridge did not bind to the IPv4 loopback address.");
  }
  boundPort = address.port;
  const ready = {
    type: "bridge-ready",
    protocolVersion: policy.PROTOCOL_VERSION,
    contractVersion: policy.CONTRACT_VERSION,
    host: "127.0.0.1",
    port: boundPort,
    sessionDirectory,
    eventsFile: eventsPath,
    stateFile: statePath
  };
  emit(stdout, jsonMode, ready,
    `Bridge ready on 127.0.0.1:${boundPort}\nSession directory: ${sessionDirectory}`);

  async function close(reason = "bridge-process-stopped") {
    if (closed) {
      return;
    }
    closed = true;
    await new Promise((resolve) => server.close(resolve));
    await writerQueue;
    if (!state.bridgeComplete) {
      state.status = reason;
      state.transportReady = false;
      state.stoppedAt = new Date().toISOString();
    }
    await persistState();
    await eventsHandle.sync();
    await eventsHandle.close();
    emit(stdout, jsonMode, {
      type: "bridge-stopped",
      status: state.status,
      transportReady: state.transportReady,
      sessionDirectory
    }, `Bridge stopped (${state.status}).`);
  }

  return { server, token, port: boundPort, sessionDirectory, eventsPath, statePath, state, close };
}

function parseCli(argv) {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: false,
      strict: true,
      options: {
        "output-root": { type: "string" },
        port: { type: "string", default: String(DEFAULT_PORT) },
        json: { type: "boolean", default: false },
        help: { type: "boolean", short: "h", default: false },
        version: { type: "boolean", default: false }
      }
    });
  } catch (error) {
    throw new ProtocolError(error.message, 2);
  }
  return parsed.values;
}

export async function main(argv = process.argv.slice(2)) {
  let values;
  try {
    values = parseCli(argv);
  } catch (error) {
    process.stderr.write(`Error: ${error.message}\nRun with --help for usage.\n`);
    return 2;
  }
  if (values.help) {
    process.stdout.write(helpText());
    return 0;
  }
  if (values.version) {
    process.stdout.write(`${VERSION}\n`);
    return 0;
  }
  if (!values["output-root"]) {
    process.stderr.write("Error: --output-root is required.\nRun with --help for usage.\n");
    return 2;
  }
  let port;
  try {
    port = parsePort(values.port);
  } catch (error) {
    process.stderr.write(`Error: ${error.message}\nRun with --help for usage.\n`);
    return 2;
  }

  let bridge;
  try {
    bridge = await createObserverBridge({
      outputRoot: values["output-root"],
      port,
      json: values.json
    });
  } catch (error) {
    process.stderr.write(`Error: could not start the loopback bridge (${error.code || error.message}).\n`);
    return 1;
  }

  return await new Promise((resolve) => {
    let stopping = false;
    const shutdown = async () => {
      if (stopping) {
        return;
      }
      stopping = true;
      try {
        await bridge.close();
        resolve(0);
      } catch (error) {
        process.stderr.write(`Error: bridge shutdown failed (${error.code || error.message}).\n`);
        resolve(1);
      }
    };
    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  });
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  process.exitCode = await main();
}
