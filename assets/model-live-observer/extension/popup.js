"use strict";

const elements = {
  sessionStatus: document.querySelector("#session-status"),
  observationCount: document.querySelector("#observation-count"),
  lastEvent: document.querySelector("#last-event"),
  message: document.querySelector("#message"),
  start: document.querySelector("#start"),
  observe: document.querySelector("#observe"),
  stop: document.querySelector("#stop")
};

const ERROR_MESSAGES = {
  BRIDGE_UNAVAILABLE: "The local bridge did not respond. Start it before starting observation.",
  BRIDGE_INVALID_RESPONSE: "The local bridge returned an invalid response.",
  BRIDGE_UNAUTHORIZED: "The automatic local bridge session was rejected.",
  BRIDGE_SESSION_CONFLICT: "The bridge already has a different active extension session.",
  BRIDGE_STOP_FAILED: "The final bridge stop was not confirmed. Treat this session as incomplete.",
  BRIDGE_TRANSPORT_INCOMPLETE: "The bridge recorded the stop, but deterministic capture/transport integrity is incomplete.",
  NO_ACTIVE_TAB: "No active browser tab is available.",
  INCOGNITO_NOT_SUPPORTED: "Incognito tabs are intentionally unsupported.",
  ORIGIN_NOT_ALLOWED: "Open one of the configured web origins in this tab before starting.",
  SESSION_ALREADY_ACTIVE: "Stop the current pinned-tab session before starting another.",
  SESSION_READBACK_FAILED: "Chrome could not preserve the exact-tab session state.",
  NO_ACTIVE_SESSION: "Start live research first.",
  SWITCH_TO_OBSERVED_TAB: "Switch to the exact tab where observation was started.",
  LEFT_OBSERVED_ORIGIN: "Observation stopped because the selected tab left its pinned origin.",
  INJECTION_FAILED: "Chrome refused the observer injection.",
  CONTENT_CONFIRMATION_FAILED: "The page observer did not confirm that it resumed.",
  OBSERVATION_MESSAGE_FAILED: "The page observer could not reach its service worker.",
  DEBUGGER_ATTACH_FAILED: "Chrome could not attach the development network observer to this tab. Close DevTools or another debugger and try again.",
  DEBUGGER_DETACH_FAILED: "Chrome did not confirm that the development network observer detached. Treat this session as incomplete.",
  DEBUGGER_DETACHED: "Chrome detached the development network observer. The session was stopped as incomplete.",
  INVALID_NETWORK_EVIDENCE: "Network capture stopped because an evidence record failed validation.",
  NETWORK_CAPTURE_FAILED: "Network capture stopped after an internal evidence failure.",
  NETWORK_HEADERS_LIMIT_EXCEEDED: "Network capture stopped because the configured header evidence limit was exceeded.",
  NETWORK_PENDING_LIMIT_EXCEEDED: "Network capture stopped because too many configured requests were pending.",
  NETWORK_FLUSH_FAILED: "Network capture could not finish its pending evidence before Stop.",
  INVALID_OBSERVATION: "Observation stopped because a page payload failed validation.",
  SNAPSHOT_HASH_MISMATCH: "Observation stopped because a snapshot hash did not match its content.",
  BRIDGE_WRITE_FAILED: "Observation stopped because the bridge could not persist an event.",
  FINAL_OBSERVATION_FAILED: "The final page state was not confirmed.",
  FINAL_OBSERVATION_NOT_CONFIRMED: "The final page state was not confirmed.",
  INTERNAL_ERROR: "The extension encountered an internal error."
};
let busy = false;

function showMessage(text) {
  elements.message.textContent = text || "";
}

async function send(message) {
  try {
    return await chrome.runtime.sendMessage(message);
  } catch (_error) {
    return { ok: false, code: "INTERNAL_ERROR" };
  }
}

function applyStatus(status) {
  const session = status.session;
  if (!session) {
    elements.sessionStatus.textContent = status.lastError ? "Stopped with an incomplete session" : "Stopped";
    elements.observationCount.textContent = "0 events";
    elements.lastEvent.textContent = "None";
  } else {
    elements.sessionStatus.textContent = session.continuityStatus === "reinjection-failed"
      ? "Resume failed - use Observe now"
      : status.activeTabIsSession ? "Model observing this tab" : "Observing another pinned tab";
    elements.observationCount.textContent = `${session.observationCount} page, ${session.networkEventCount || 0} network`;
    const networkIsLatest = session.lastNetworkAt && (!session.lastObservationAt || session.lastNetworkAt > session.lastObservationAt);
    elements.lastEvent.textContent = networkIsLatest
      ? session.lastNetworkKind
      : session.lastObservationKind || "Waiting";
  }
  elements.start.disabled = busy || Boolean(session);
  elements.observe.disabled = busy || !session || !status.activeTabIsSession;
  elements.stop.disabled = busy || !session;
  if (status.lastError) {
    showMessage(ERROR_MESSAGES[status.lastError] || status.lastError);
  }
}

async function refreshStatus() {
  const status = await send({ type: "get-status" });
  if (!status.ok) {
    showMessage(ERROR_MESSAGES[status.code] || status.code || "Status unavailable.");
    return;
  }
  applyStatus(status);
}

function setBusy(value) {
  busy = value;
  for (const element of [elements.start, elements.observe, elements.stop]) {
    element.disabled = value || element.disabled;
  }
}

async function runBusy(operation) {
  if (busy) {
    return;
  }
  setBusy(true);
  try {
    await operation();
  } finally {
    busy = false;
    await refreshStatus();
  }
}

elements.start.addEventListener("click", () => runBusy(async () => {
  showMessage("");
  const response = await send({ type: "start-session" });
  if (!response.ok) {
    showMessage(ERROR_MESSAGES[response.code] || response.code || "Start failed.");
  } else {
    showMessage("Bridge connected. Sensitive development evidence is now recording from this exact tab.");
  }
}));

elements.observe.addEventListener("click", () => runBusy(async () => {
  showMessage("");
  const response = await send({ type: "observe-now" });
  showMessage(response.ok
    ? "Current page state reached the model bridge."
    : ERROR_MESSAGES[response.code] || response.code || "Observation failed.");
}));

elements.stop.addEventListener("click", () => runBusy(async () => {
  showMessage("");
  const response = await send({ type: "stop-session" });
  if (response.ok) {
    showMessage("Observation stopped after the final page state and bridge stop were confirmed.");
  } else {
    showMessage(ERROR_MESSAGES[response.code] || response.code || "Stop was incomplete.");
  }
}));

refreshStatus();
