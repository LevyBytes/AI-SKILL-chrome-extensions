#!/usr/bin/env node

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

const require = createRequire(import.meta.url);
const policy = require("../extension/observer-policy.js");
const VERSION = "0.3.1";
const EVENT_TYPES = new Set([
  "network.graphql.failure",
  "network.graphql.request",
  "network.graphql.response",
  "observation",
  "session.aborted",
  "session.started",
  "session.stopped"
]);
const SNAPSHOT_REASONS = new Set(["final", "initial", "interaction", "manual", "mutation"]);
const SNAPSHOT_SUMMARY_KEYS = [
  "byteLength",
  "documentState",
  "kind",
  "observationId",
  "observedAt",
  "pageKind",
  "reason",
  "redactions",
  "sha256",
  "snapshotFile",
  "sourceTrust",
  "title",
  "truncated",
  "url",
  "viewport"
];
const STATE_KEYS = [
  "bridgeComplete",
  "bridgeSessionId",
  "bridgeVersion",
  "captureComplete",
  "contractVersion",
  "eventCount",
  "expectedSequence",
  "extensionSessionId",
  "finalSnapshotComplete",
  "interactionCount",
  "incompleteNetworkEvents",
  "lastEvent",
  "lastEventHash",
  "lastEventId",
  "lastSequence",
  "pinnedExtensionOrigin",
  "pinnedPageOrigin",
  "schemaVersion",
  "snapshotCount",
  "networkFailureCount",
  "networkRequestCount",
  "networkResponseCount",
  "startedAt",
  "status",
  "stoppedAt",
  "totalSnapshotBytes",
  "totalNetworkBodyBytes",
  "transportReady",
  "truncatedSnapshots"
];

function sha256(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasExactKeys(value, expected) {
  if (!isPlainObject(value)) return false;
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  return actual.length === wanted.length && actual.every((key, index) => key === wanted[index]);
}

function validUuid(value) {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function validIsoTimestamp(value) {
  if (typeof value !== "string") return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString() === value;
}

function validHash(value) {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function validStartPayload(value) {
  return hasExactKeys(value, ["extensionVersion", "networkCapture", "startedAt", "startUrl", "tabId", "windowId"]) &&
    typeof value.extensionVersion === "string" && /^\d+\.\d+\.\d+$/.test(value.extensionVersion) &&
    validIsoTimestamp(value.startedAt) &&
    policy.normalizeObservedUrl(value.startUrl) === value.startUrl &&
    Number.isInteger(value.tabId) && value.tabId >= 0 &&
    Number.isInteger(value.windowId) && validNetworkCapturePolicy(value.networkCapture);
}

function validNetworkCapturePolicy(value) {
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

function validStopPayload(value, complete) {
  return hasExactKeys(value, ["complete", "reason", "stoppedAt"]) &&
    value.complete === complete &&
    typeof value.reason === "string" && /^[A-Z0-9_]{1,100}$/.test(value.reason) &&
    validIsoTimestamp(value.stoppedAt);
}

function validRedactions(value) {
  return hasExactKeys(value, [
    "normalizedLinks",
    "removedAttributes",
    "removedComments",
    "removedContentEditable",
    "removedCredentialTextNodes",
    "removedElements"
  ]) && Object.values(value).every((count) => Number.isInteger(count) && count >= 0 && count <= 10000000);
}

function validDocumentState(value) {
  return hasExactKeys(value, ["mutationQuietMs", "readyState"]) &&
    ["complete", "interactive", "loading"].includes(value.readyState) &&
    Number.isInteger(value.mutationQuietMs) && value.mutationQuietMs >= 0 && value.mutationQuietMs <= 60000;
}

function validSnapshotSummary(value) {
  return hasExactKeys(value, SNAPSHOT_SUMMARY_KEYS) &&
    value.kind === "snapshot" &&
    validUuid(value.observationId) &&
    validIsoTimestamp(value.observedAt) &&
    policy.classifyUrl(value.url) === value.pageKind &&
    policy.normalizeObservedUrl(value.url) === value.url &&
    typeof value.title === "string" && value.title.length <= 300 &&
    !policy.containsCredentialLikeValue(value.title) &&
    SNAPSHOT_REASONS.has(value.reason) &&
    value.sourceTrust === policy.SOURCE_TRUST &&
    typeof value.snapshotFile === "string" &&
    validHash(value.sha256) &&
    Number.isInteger(value.byteLength) && value.byteLength > 0 && value.byteLength <= policy.MAX_CAPTURE_BYTES &&
    typeof value.truncated === "boolean" &&
    validRedactions(value.redactions) &&
    validDocumentState(value.documentState) &&
    policy.validateViewport(value.viewport);
}

function validPersistedPayload(eventType, payload) {
  if (eventType === "session.started") return validStartPayload(payload);
  if (eventType === "session.stopped") return validStopPayload(payload, true);
  if (eventType === "session.aborted") return validStopPayload(payload, false);
  if (eventType.startsWith("network.graphql.")) {
    const expectedKind = eventType.slice("network.".length).replace(".", "-");
    return hasExactKeys(payload, ["network"]) && policy.validateNetworkEvidence(payload.network) &&
      payload.network.kind === expectedKind;
  }
  if (eventType !== "observation") return false;
  if (validSnapshotSummary(payload)) return true;
  return hasExactKeys(payload, ["observation"]) &&
    policy.validateObservation(payload.observation) && payload.observation.kind === "interaction";
}

function summarizeObservation(observation, snapshotFile) {
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

function safeSnapshotPath(sessionDirectory, relativePath) {
  if (typeof relativePath !== "string" ||
      !/^snapshots\/\d{6}-[a-f0-9]{16}\.snapshot\.json$/.test(relativePath)) {
    return null;
  }
  const resolved = path.resolve(sessionDirectory, ...relativePath.split("/"));
  const snapshotsRoot = path.resolve(sessionDirectory, "snapshots") + path.sep;
  return resolved.startsWith(snapshotsRoot) ? resolved : null;
}

function readStrictJson(filePath, errors, label) {
  try {
    const bytes = fs.readFileSync(filePath);
    if (bytes.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf]))) {
      errors.push(`${label} has a UTF-8 BOM`);
    }
    if (bytes.includes(0x0d)) {
      errors.push(`${label} contains CR bytes`);
    }
    const text = bytes.toString("utf8");
    const value = JSON.parse(text);
    if (text !== `${JSON.stringify(value, null, 2)}\n`) {
      errors.push(`${label} is not in the bridge's canonical JSON form`);
    }
    return value;
  } catch (error) {
    errors.push(`${label} could not be parsed: ${error.code || error.message}`);
    return null;
  }
}

export function validateSession(sessionDirectory) {
  const directory = path.resolve(sessionDirectory);
  const errors = [];
  const warnings = [];
  const eventsPath = path.join(directory, "events.ndjson");
  const statePath = path.join(directory, "bridge-state.json");
  const snapshotsDirectory = path.join(directory, "snapshots");
  let eventText = "";
  try {
    const bytes = fs.readFileSync(eventsPath);
    if (bytes.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf]))) errors.push("events.ndjson has a UTF-8 BOM");
    if (bytes.includes(0x0d)) errors.push("events.ndjson contains CR bytes");
    eventText = bytes.toString("utf8");
    if (eventText && !eventText.endsWith("\n")) errors.push("events.ndjson has a partial final line");
  } catch (error) {
    errors.push(`events.ndjson could not be read: ${error.code || error.message}`);
  }
  const state = readStrictJson(statePath, errors, "bridge-state.json");
  if (!isPlainObject(state)) errors.push("bridge-state has an invalid schema");
  const rawLines = eventText.split("\n");
  if (rawLines.slice(0, -1).some((line) => line.length === 0)) {
    errors.push("events.ndjson contains an empty record line");
  }
  const lines = rawLines.filter((line) => line.length > 0);
  const records = [];
  for (let index = 0; index < lines.length; index += 1) {
    try {
      const record = JSON.parse(lines[index]);
      if (lines[index] !== JSON.stringify(record)) {
        errors.push(`events.ndjson line ${index + 1} is not in the bridge's canonical JSON form`);
      }
      records.push(record);
    } catch (_error) {
      errors.push(`events.ndjson line ${index + 1} is invalid JSON`);
    }
  }
  if (records.length === 0) errors.push("session has no events");

  let sessionId = null;
  let previousHash = null;
  let snapshotCount = 0;
  let interactionCount = 0;
  let networkRequestCount = 0;
  let networkResponseCount = 0;
  let networkFailureCount = 0;
  let totalNetworkBodyBytes = 0;
  let incompleteNetworkEvents = 0;
  let totalSnapshotBytes = 0;
  let truncatedSnapshots = 0;
  let finalSnapshotComplete = false;
  let pinnedPageOrigin = null;
  let terminalSeen = false;
  const referencedSnapshots = new Set();

  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    if (!hasExactKeys(record, [
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
      errors.push(`event ${index} has an invalid schema`);
      continue;
    }
    if (record.schemaVersion !== policy.PROTOCOL_VERSION ||
        record.contractVersion !== policy.CONTRACT_VERSION ||
        !validUuid(record.sessionId) ||
        !validUuid(record.eventId) ||
        !validIsoTimestamp(record.observedAt) ||
        !Number.isInteger(record.seq) || record.seq < 0 ||
        !EVENT_TYPES.has(record.eventType) ||
        !validHash(record.payloadHash) ||
        (record.previousEventHash !== null && !validHash(record.previousEventHash)) ||
        !validHash(record.eventHash) ||
        !validPersistedPayload(record.eventType, record.payload)) {
      errors.push(`event ${index} violates the persisted event contract`);
    }
    if (record.seq !== index) errors.push(`event ${index} has sequence ${record.seq}`);
    if (index === 0) sessionId = record.sessionId;
    if (record.sessionId !== sessionId) errors.push(`event ${index} changed session ID`);
    if (record.previousEventHash !== previousHash) errors.push(`event ${index} broke the previous-hash chain`);

    if (index === 0 && record.eventType !== "session.started") {
      errors.push("first event is not session.started");
    }
    if (index > 0 && record.eventType === "session.started") {
      errors.push(`event ${index} repeats session.started`);
    }
    if (terminalSeen) {
      errors.push(`event ${index} appears after a terminal event`);
    }
    if (record.eventType === "session.stopped" || record.eventType === "session.aborted") {
      terminalSeen = true;
      if (index !== records.length - 1) errors.push(`event ${index} is terminal but not last`);
    }

    if (record.eventType === "session.started") {
      const startUrl = record.payload?.startUrl;
      if (index !== 0 || policy.normalizeObservedUrl(startUrl) !== startUrl) {
        errors.push(`event ${index} has an invalid session start URL`);
      } else {
        pinnedPageOrigin = new URL(startUrl).origin;
      }
    }

    let originalPayload = record.payload;
    if (record.eventType === "observation" && record.payload?.kind === "snapshot") {
      if (!validSnapshotSummary(record.payload)) {
        errors.push(`snapshot event ${index} violates the persisted summary contract`);
      }
      const snapshotPath = safeSnapshotPath(directory, record.payload.snapshotFile);
      if (!snapshotPath) {
        errors.push(`event ${index} has an unsafe snapshot path`);
      } else {
        referencedSnapshots.add(path.basename(snapshotPath));
        const evidence = readStrictJson(snapshotPath, errors, `snapshot for event ${index}`);
        if (evidence) {
          if (!hasExactKeys(evidence, [
            "contractVersion",
            "eventHash",
            "eventId",
            "observation",
            "payloadHash",
            "schemaVersion",
            "seq",
            "sessionId"
          ])) {
            errors.push(`snapshot for event ${index} has an invalid schema`);
          } else {
            if (evidence.schemaVersion !== policy.PROTOCOL_VERSION ||
                evidence.contractVersion !== policy.CONTRACT_VERSION ||
                !validUuid(evidence.sessionId) ||
                !validUuid(evidence.eventId) ||
                !Number.isInteger(evidence.seq) || evidence.seq < 0 ||
                !validHash(evidence.payloadHash) || !validHash(evidence.eventHash)) {
              errors.push(`snapshot for event ${index} violates the snapshot evidence contract`);
            }
            if (evidence.seq !== record.seq || evidence.eventId !== record.eventId ||
                evidence.eventHash !== record.eventHash || evidence.payloadHash !== record.payloadHash ||
                evidence.sessionId !== record.sessionId ||
                evidence.schemaVersion !== record.schemaVersion ||
                evidence.contractVersion !== record.contractVersion) {
              errors.push(`snapshot for event ${index} does not match its event reference`);
            }
            if (!policy.validateObservation(evidence.observation)) {
              errors.push(`snapshot for event ${index} violates the observation contract`);
            } else {
              if (pinnedPageOrigin && new URL(evidence.observation.url).origin !== pinnedPageOrigin) {
                errors.push(`snapshot for event ${index} changed the pinned page origin`);
              }
              if (sha256(evidence.observation.sanitizedHtml) !== evidence.observation.sha256) {
                errors.push(`snapshot for event ${index} has a mismatched DOM hash`);
              }
              if (policy.canonicalStringify(summarizeObservation(evidence.observation, record.payload.snapshotFile)) !==
                  policy.canonicalStringify(record.payload)) {
                errors.push(`snapshot summary for event ${index} does not match its snapshot file`);
              }
              originalPayload = { observation: evidence.observation };
              snapshotCount += 1;
              totalSnapshotBytes += evidence.observation.byteLength;
              if (evidence.observation.truncated) truncatedSnapshots += 1;
              if (evidence.observation.reason === "final") {
                finalSnapshotComplete = Boolean(
                  !evidence.observation.truncated && evidence.observation.documentState.readyState === "complete"
                );
              }
            }
          }
        }
      }
    } else if (record.eventType === "observation") {
      if (!hasExactKeys(record.payload, ["observation"]) || !policy.validateObservation(record.payload.observation) ||
          record.payload.observation.kind !== "interaction") {
        errors.push(`interaction event ${index} violates the observation contract`);
      } else {
        if (pinnedPageOrigin && new URL(record.payload.observation.url).origin !== pinnedPageOrigin) {
          errors.push(`interaction event ${index} changed the pinned page origin`);
        }
        interactionCount += 1;
      }
    } else if (record.eventType.startsWith("network.graphql.")) {
      if (!hasExactKeys(record.payload, ["network"]) || !policy.validateNetworkEvidence(record.payload.network)) {
        errors.push(`network event ${index} violates the network evidence contract`);
      } else {
        const network = record.payload.network;
        const expectedKind = record.eventType.slice("network.".length).replace(".", "-");
        if (network.kind !== expectedKind) {
          errors.push(`network event ${index} kind does not match its event type`);
        }
        if (pinnedPageOrigin && new URL(network.url).origin !== pinnedPageOrigin) {
          errors.push(`network event ${index} changed the pinned page origin`);
        }
        if (network.kind === "graphql-request") networkRequestCount += 1;
        else if (network.kind === "graphql-response") networkResponseCount += 1;
        else networkFailureCount += 1;
        if (network.body) {
          if (network.body.complete) {
            totalNetworkBodyBytes += network.body.byteLength;
            if (sha256(network.body.body) !== network.body.sha256) {
              errors.push(`network event ${index} has a mismatched body hash`);
            }
          } else {
            incompleteNetworkEvents += 1;
          }
        } else if (network.kind === "graphql-failure") {
          incompleteNetworkEvents += 1;
        }
      }
    }

    if (sha256(policy.canonicalStringify(originalPayload)) !== record.payloadHash) {
      errors.push(`event ${index} has a mismatched payload hash`);
    }
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
    if (sha256(policy.canonicalStringify(core)) !== record.eventHash) {
      errors.push(`event ${index} has a mismatched event hash`);
    }
    previousHash = record.eventHash;
  }

  if (records.length > 0 && !terminalSeen) errors.push("session has no terminal event");

  let snapshotFiles = [];
  try {
    snapshotFiles = fs.readdirSync(snapshotsDirectory).sort();
  } catch (error) {
    errors.push(`snapshots directory could not be read: ${error.code || error.message}`);
  }
  for (const name of snapshotFiles) {
    if (!referencedSnapshots.has(name)) errors.push(`unreferenced snapshot file: ${name}`);
  }
  for (const name of referencedSnapshots) {
    if (!snapshotFiles.includes(name)) errors.push(`missing referenced snapshot file: ${name}`);
  }

  const last = records.at(-1) || null;
  const penultimate = records.at(-2) || null;
  const deterministicReady = Boolean(
    errors.length === 0 &&
    last?.eventType === "session.stopped" &&
    last.payload?.complete === true &&
    penultimate?.eventType === "observation" &&
    penultimate.payload?.kind === "snapshot" &&
    penultimate.payload?.reason === "final" &&
    finalSnapshotComplete &&
    snapshotCount > 0 &&
    truncatedSnapshots === 0 &&
    incompleteNetworkEvents === 0
  );

  if (isPlainObject(state)) {
    if (!hasExactKeys(state, STATE_KEYS)) {
      errors.push("bridge-state has an invalid schema");
    }
    if (state.schemaVersion !== policy.PROTOCOL_VERSION ||
        state.contractVersion !== policy.CONTRACT_VERSION ||
        state.bridgeVersion !== VERSION ||
        !validUuid(state.bridgeSessionId) ||
        !validIsoTimestamp(state.startedAt) ||
        (state.stoppedAt !== null && !validIsoTimestamp(state.stoppedAt)) ||
        typeof state.status !== "string" || state.status.length === 0 || state.status.length > 100 ||
        !/^chrome-extension:\/\/[a-p]{32}$/.test(state.pinnedExtensionOrigin)) {
      errors.push("bridge-state violates the state contract");
    }
    const terminal = last && (last.eventType === "session.stopped" || last.eventType === "session.aborted");
    const expectedBridgeComplete = Boolean(terminal);
    const expectedCaptureComplete = Boolean(terminal && last.payload?.complete === true);
    const expectedStatus = deterministicReady ? "transport-complete" : expectedBridgeComplete ? "incomplete" : null;
    const comparisons = {
      schemaVersion: policy.PROTOCOL_VERSION,
      contractVersion: policy.CONTRACT_VERSION,
      bridgeVersion: VERSION,
      extensionSessionId: sessionId,
      expectedSequence: records.length,
      lastSequence: records.length - 1,
      lastEventId: last?.eventId || null,
      lastEventHash: last?.eventHash || null,
      eventCount: records.length,
      snapshotCount,
      interactionCount,
      networkRequestCount,
      networkResponseCount,
      networkFailureCount,
      totalNetworkBodyBytes,
      incompleteNetworkEvents,
      totalSnapshotBytes,
      truncatedSnapshots,
      finalSnapshotComplete,
      captureComplete: expectedCaptureComplete,
      bridgeComplete: expectedBridgeComplete,
      pinnedPageOrigin,
      lastEvent: last,
      transportReady: deterministicReady
    };
    for (const [name, expected] of Object.entries(comparisons)) {
      const matches = isPlainObject(expected) || Array.isArray(expected)
        ? policy.canonicalStringify(state[name]) === policy.canonicalStringify(expected)
        : state[name] === expected;
      if (!matches) errors.push(`bridge-state ${name} does not match evidence`);
    }
    if (expectedStatus !== null && state.status !== expectedStatus) {
      errors.push("bridge-state status does not match evidence");
    }
    if (terminal && state.stoppedAt !== last.payload.stoppedAt) {
      errors.push("bridge-state stoppedAt does not match the terminal event");
    }
  }
  if (!deterministicReady && errors.length === 0) errors.push("session is structurally valid but incomplete");
  const validatedReady = deterministicReady && errors.length === 0;

  return {
    schemaVersion: 1,
    validator: `Live Research Observer Validator ${VERSION}`,
    status: errors.length === 0 ? "passed" : "failed",
    errors,
    warnings,
    summary: {
      sessionDirectory: directory,
      sessionId,
      events: records.length,
      snapshots: snapshotCount,
      interactions: interactionCount,
      networkRequests: networkRequestCount,
      networkResponses: networkResponseCount,
      networkFailures: networkFailureCount,
      networkBodyBytes: totalNetworkBodyBytes,
      incompleteNetworkEvents,
      snapshotBytes: totalSnapshotBytes,
      truncatedSnapshots,
      finalSnapshotComplete,
      transportReady: validatedReady
    }
  };
}

function helpText() {
  return `Live Research Observer Session Validator v${VERSION}

USAGE
  node bridge/validate-live-session.mjs --session <directory> [--json]

FLAGS
      --session <directory>  completed bridge session directory
      --json                 emit the report as JSON
  -h, --help                 show help
      --version              show version

EXIT CODES
  0  valid, complete, transport-ready session
  1  invalid, corrupt, truncated, or incomplete session
  2  command usage error
`;
}

export async function main(argv = process.argv.slice(2)) {
  let values;
  try {
    values = parseArgs({
      args: argv,
      allowPositionals: false,
      strict: true,
      options: {
        session: { type: "string" },
        json: { type: "boolean", default: false },
        help: { type: "boolean", short: "h", default: false },
        version: { type: "boolean", default: false }
      }
    }).values;
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
  if (!values.session) {
    process.stderr.write("Error: --session is required.\nRun with --help for usage.\n");
    return 2;
  }
  const report = validateSession(values.session);
  if (values.json) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } else if (report.status === "passed") {
    process.stdout.write(`Passed: ${report.summary.events} events, ${report.summary.snapshots} snapshots, ${report.summary.interactions} interactions.\n`);
  } else {
    for (const error of report.errors) process.stderr.write(`Error: ${error}\n`);
  }
  return report.status === "passed" ? 0 : 1;
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  process.exitCode = await main();
}
