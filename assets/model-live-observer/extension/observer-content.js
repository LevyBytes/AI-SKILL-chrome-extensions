(function initializeModelLiveObserver() {
  "use strict";

  const existingInstance = globalThis.__MODEL_LIVE_WEBPAGE_OBSERVER__;
  if (existingInstance?.active === true) {
    return;
  }
  if (typeof existingInstance?.dispose === "function") {
    existingInstance.dispose();
  }
  const observerInstance = { active: true, dispose: null };
  globalThis.__MODEL_LIVE_WEBPAGE_OBSERVER__ = observerInstance;

  const policy = globalThis.ModelLiveObserverPolicy;
  if (!policy) {
    return;
  }

  let sessionId = null;
  let mutationTimer = null;
  let mutationObserver = null;
  let stopped = false;
  let observationQueue = Promise.resolve();

  function emptyRedactions() {
    return {
      removedElements: 0,
      removedContentEditable: 0,
      removedComments: 0,
      removedCredentialTextNodes: 0,
      removedAttributes: 0,
      normalizedLinks: 0
    };
  }

  function truncateUtf8(value, maximumBytes) {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(value);
    if (encoded.byteLength <= maximumBytes) {
      return { value, byteLength: encoded.byteLength, truncated: false };
    }
    const shortened = new TextDecoder().decode(encoded.slice(0, Math.max(0, maximumBytes - 4)));
    return {
      value: shortened,
      byteLength: encoder.encode(shortened).byteLength,
      truncated: true
    };
  }

  const VOID_ELEMENTS = new Set([
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
    "param", "source", "track", "wbr"
  ]);
  const REMOVED_ELEMENT_SET = new Set(policy.REMOVED_ELEMENTS);

  function escapeHtml(value, attribute = false) {
    let escaped = String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    if (attribute) {
      escaped = escaped.replace(/"/g, "&quot;");
    }
    return escaped;
  }

  function sanitizedOpeningTag(element, redactions, captureState) {
    const tag = String(element.tagName || "").toLowerCase();
    if (!/^[a-z][a-z0-9-]{0,63}$/.test(tag)) {
      redactions.removedElements += 1;
      return null;
    }
    if (REMOVED_ELEMENT_SET.has(tag)) {
      redactions.removedElements += 1;
      return null;
    }
    if (element.hasAttribute?.("contenteditable") || element.getAttribute?.("role") === "textbox") {
      redactions.removedContentEditable += 1;
      return null;
    }
    const attributes = [];
    const source = element.attributes || [];
    const limit = Math.min(source.length, policy.MAX_ELEMENT_ATTRIBUTES);
    for (let index = 0; index < limit; index += 1) {
      const attribute = source[index];
      const name = String(attribute.name || "").toLowerCase();
      const rawValue = String(attribute.value || "");
      if (rawValue.length > policy.MAX_RAW_ATTRIBUTE_CHARS) {
        captureState.truncated = true;
      }
      let value = null;
      if (name === "href") {
        value = policy.normalizeObservedHref(rawValue.slice(0, policy.MAX_RAW_ATTRIBUTE_CHARS), location.href);
        if (value) redactions.normalizedLinks += 1;
      } else {
        value = policy.sanitizeAttributeValue(name, rawValue, location.href);
      }
      if (value === null) {
        redactions.removedAttributes += 1;
      } else {
        attributes.push(`${name}="${escapeHtml(value, true)}"`);
      }
    }
    if (source.length > limit) {
      redactions.removedAttributes += source.length - limit;
    }
    return { tag, value: `<${tag}${attributes.length ? ` ${attributes.join(" ")}` : ""}>` };
  }

  function serializeDocumentBounded(redactions) {
    const encoder = new TextEncoder();
    const fragments = ["<!doctype html>\n"];
    let byteLength = encoder.encode(fragments[0]).byteLength;
    const captureState = { truncated: false };
    let nodeCount = 0;
    const stack = [{ node: document.documentElement, entered: false, nextChild: null, tag: null, depth: 0 }];

    function append(fragment, allowPartial = false) {
      const remaining = policy.MAX_CAPTURE_BYTES - byteLength;
      const bytes = encoder.encode(fragment);
      if (bytes.byteLength <= remaining) {
        fragments.push(fragment);
        byteLength += bytes.byteLength;
        return true;
      }
      if (allowPartial && remaining > 0) {
        const partial = truncateUtf8(fragment, remaining);
        if (partial.value) {
          fragments.push(partial.value);
          byteLength += partial.byteLength;
        }
      }
      captureState.truncated = true;
      return false;
    }

    while (stack.length > 0 && !captureState.truncated) {
      const frame = stack[stack.length - 1];
      if (!frame.entered) {
        nodeCount += 1;
        if (nodeCount > policy.MAX_CAPTURE_NODES || frame.depth > policy.MAX_CAPTURE_DEPTH) {
          captureState.truncated = true;
          break;
        }
        const nodeType = Number(frame.node?.nodeType || 0);
        if (nodeType === 8) {
          redactions.removedComments += 1;
          stack.pop();
          continue;
        }
        if (nodeType === 3) {
          const rawValue = String(frame.node.data || "");
          if (rawValue.length > policy.MAX_RAW_TEXT_CHARS) {
            captureState.truncated = true;
          }
          const value = rawValue.slice(0, policy.MAX_RAW_TEXT_CHARS);
          if (policy.containsCredentialLikeValue(value)) {
            redactions.removedCredentialTextNodes += 1;
          } else {
            append(escapeHtml(value), true);
          }
          stack.pop();
          continue;
        }
        if (nodeType !== 1) {
          stack.pop();
          continue;
        }
        const opening = sanitizedOpeningTag(frame.node, redactions, captureState);
        if (!opening) {
          stack.pop();
          continue;
        }
        if (!append(opening.value)) {
          break;
        }
        frame.entered = true;
        frame.tag = opening.tag;
        frame.nextChild = frame.node.firstChild || null;
        if (VOID_ELEMENTS.has(frame.tag)) {
          stack.pop();
        }
        continue;
      }
      if (frame.nextChild) {
        const child = frame.nextChild;
        frame.nextChild = child.nextSibling || null;
        stack.push({ node: child, entered: false, nextChild: null, tag: null, depth: frame.depth + 1 });
        continue;
      }
      if (!append(`</${frame.tag}>`)) {
        break;
      }
      stack.pop();
    }
    return { value: fragments.join(""), byteLength, truncated: captureState.truncated };
  }

  async function sha256(value) {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  function viewport() {
    const root = document.documentElement;
    const body = document.body;
    return {
      innerWidth: Math.max(0, Math.round(window.innerWidth || 0)),
      innerHeight: Math.max(0, Math.round(window.innerHeight || 0)),
      scrollX: Math.max(0, Math.round(window.scrollX || 0)),
      scrollY: Math.max(0, Math.round(window.scrollY || 0)),
      documentWidth: Math.max(0, Math.round(Math.max(
        root?.scrollWidth || 0,
        root?.offsetWidth || 0,
        body?.scrollWidth || 0,
        body?.offsetWidth || 0
      ))),
      documentHeight: Math.max(0, Math.round(Math.max(
        root?.scrollHeight || 0,
        root?.offsetHeight || 0,
        body?.scrollHeight || 0,
        body?.offsetHeight || 0
      ))),
      devicePixelRatio: Math.max(0.01, Math.min(16, Number(window.devicePixelRatio) || 1))
    };
  }

  function pageIdentity() {
    const url = policy.normalizeObservedUrl(location.href);
    const pageKind = policy.classifyUrl(location.href);
    return url && pageKind ? { url, pageKind } : null;
  }

  async function buildSnapshot(reason) {
    const identity = pageIdentity();
    if (!identity) {
      return null;
    }
    const redactions = emptyRedactions();
    const bounded = serializeDocumentBounded(redactions);
    return {
      schemaVersion: policy.PROTOCOL_VERSION,
      contractVersion: policy.CONTRACT_VERSION,
      sourceTrust: policy.SOURCE_TRUST,
      kind: "snapshot",
      observationId: crypto.randomUUID(),
      observedAt: new Date().toISOString(),
      ...identity,
      title: policy.sanitizeText(document.title, 300),
      reason,
      sanitizedHtml: bounded.value,
      byteLength: bounded.byteLength,
      truncated: bounded.truncated,
      sha256: await sha256(bounded.value),
      redactions,
      documentState: {
        readyState: ["loading", "interactive", "complete"].includes(document.readyState)
          ? document.readyState
          : "loading",
        mutationQuietMs: reason === "mutation"
          ? policy.MUTATION_DEBOUNCE_MS
          : reason === "interaction" ? policy.INTERACTION_SNAPSHOT_DELAY_MS : 0
      },
      viewport: viewport()
    };
  }

  function actionableElement(target) {
    if (!(target instanceof Element)) {
      return null;
    }
    return target.closest("a,button,[role='button'],[role='tab'],[aria-controls],[data-action]") || target;
  }

  function boundedElementText(element) {
    const maximumCharacters = Math.min(policy.MAX_RAW_TEXT_CHARS, 4096);
    const maximumNodes = 256;
    const maximumDepth = 32;
    const fragments = [];
    let characters = 0;
    let visited = 0;
    const stack = [];
    if (element.firstChild) {
      stack.push({ node: element.firstChild, depth: 0 });
    }
    while (stack.length > 0 && visited < maximumNodes && characters < maximumCharacters) {
      const current = stack.pop();
      const node = current.node;
      if (!node) continue;
      visited += 1;
      if (node.nextSibling) {
        stack.push({ node: node.nextSibling, depth: current.depth });
      }
      if (node.nodeType === 3) {
        const remaining = maximumCharacters - characters;
        const text = String(node.data || "").slice(0, remaining);
        fragments.push(text);
        characters += text.length;
      } else if (node.nodeType === 1) {
        const tag = String(node.tagName || "").toLowerCase();
        const excluded = REMOVED_ELEMENT_SET.has(tag) ||
          node.hasAttribute?.("contenteditable") || node.getAttribute?.("role") === "textbox";
        if (!excluded && current.depth < maximumDepth && node.firstChild) {
          stack.push({ node: node.firstChild, depth: current.depth + 1 });
        }
      }
    }
    return fragments.join(" ");
  }

  function targetDescriptor(target) {
    const element = actionableElement(target);
    if (!element) {
      return null;
    }
    const dataAttributes = {};
    const attributes = element.attributes || [];
    const attributeLimit = Math.min(Number(attributes.length) || 0, policy.MAX_ELEMENT_ATTRIBUTES);
    let dataAttributeCount = 0;
    for (let index = 0; index < attributeLimit && dataAttributeCount < policy.MAX_DATA_ATTRIBUTES; index += 1) {
      const attribute = attributes[index];
      const name = String(attribute?.name || "").toLowerCase();
      if (!name.startsWith("data-")) {
        continue;
      }
      const sanitized = policy.sanitizeAttributeValue(name, attribute?.value, location.href);
      if (sanitized !== null) {
        dataAttributes[name] = sanitized;
        dataAttributeCount += 1;
      }
    }
    const formValueTag = ["input", "option", "select", "textarea"].includes(element.tagName.toLowerCase());
    const editableContext = element.hasAttribute("contenteditable") || element.getAttribute("role") === "textbox" ||
      Boolean(element.closest?.("[contenteditable],[role='textbox']"));
    const href = element.hasAttribute("href")
      ? policy.normalizeObservedHref(element.getAttribute("href"), location.href)
      : null;
    const classNames = [];
    const classList = element.classList || [];
    const classLimit = Math.min(Number(classList.length) || 0, 16);
    for (let index = 0; index < classLimit; index += 1) {
      const sanitized = policy.sanitizeText(classList[index], 120);
      if (sanitized) classNames.push(sanitized);
    }
    return {
      tag: element.tagName.toLowerCase(),
      id: policy.sanitizeText(element.id, 120) || null,
      classNames,
      role: policy.sanitizeText(element.getAttribute("role"), 120) || null,
      ariaLabel: policy.sanitizeText(element.getAttribute("aria-label"), 240) || null,
      text: formValueTag || editableContext ? null : policy.sanitizeText(boundedElementText(element), 240) || null,
      href,
      dataAttributes
    };
  }

  function buildInteraction(interactionType, target) {
    const identity = pageIdentity();
    const descriptor = targetDescriptor(target);
    if (!identity || !descriptor) {
      return null;
    }
    return {
      schemaVersion: policy.PROTOCOL_VERSION,
      contractVersion: policy.CONTRACT_VERSION,
      sourceTrust: policy.SOURCE_TRUST,
      kind: "interaction",
      observationId: crypto.randomUUID(),
      observedAt: new Date().toISOString(),
      ...identity,
      interactionType,
      target: descriptor,
      viewport: viewport()
    };
  }

  async function transmit(observation) {
    if (stopped || !sessionId) {
      return { ok: false, code: "CONTENT_NOT_ACTIVE" };
    }
    if (!policy.validateObservation(observation)) {
      return reportLocalFailure("INVALID_LOCAL_OBSERVATION");
    }
    try {
      const response = await chrome.runtime.sendMessage({
        type: "observation",
        sessionId,
        observation
      });
      if (!response || response.ok !== true) {
        stopLocally();
        return response || { ok: false, code: "OBSERVATION_MESSAGE_FAILED" };
      }
      return response;
    } catch (_error) {
      stopLocally();
      return { ok: false, code: "OBSERVATION_MESSAGE_FAILED" };
    }
  }

  function enqueue(operation) {
    const queued = observationQueue.then(operation);
    observationQueue = queued.catch(() => undefined);
    return queued;
  }

  function capture(reason) {
    return enqueue(async () => {
      if (stopped || !sessionId) {
        return { ok: false, code: "CONTENT_NOT_ACTIVE" };
      }
      let snapshot;
      try {
        snapshot = await buildSnapshot(reason);
      } catch (_error) {
        return reportLocalFailure("LOCAL_SNAPSHOT_BUILD_FAILED");
      }
      if (!snapshot) {
        return reportLocalFailure("INVALID_LOCAL_OBSERVATION");
      }
      return transmit(snapshot);
    });
  }

  function queueMutationCapture() {
    if (stopped || !sessionId) {
      return;
    }
    clearTimeout(mutationTimer);
    mutationTimer = setTimeout(() => {
      capture("mutation");
    }, policy.MUTATION_DEBOUNCE_MS);
  }

  function handleTrustedInteraction(event) {
    if (event.isTrusted !== true || stopped || !sessionId || !(event.target instanceof Element)) {
      return;
    }
    const interactionType = event.type === "change" ? "change" : "click";
    const interaction = buildInteraction(interactionType, event.target);
    if (!interaction || !policy.validateObservation(interaction)) {
      reportLocalFailure("INVALID_LOCAL_OBSERVATION");
      return;
    }
    enqueue(async () => {
      const sent = await transmit(interaction);
      if (!sent || sent.ok !== true || stopped) {
        return sent;
      }
      await new Promise((resolve) => setTimeout(resolve, policy.INTERACTION_SNAPSHOT_DELAY_MS));
      let snapshot;
      try {
        snapshot = await buildSnapshot("interaction");
      } catch (_error) {
        return reportLocalFailure("LOCAL_SNAPSHOT_BUILD_FAILED");
      }
      return snapshot
        ? transmit(snapshot)
        : reportLocalFailure("INVALID_LOCAL_OBSERVATION");
    });
  }

  function stopLocally() {
    stopped = true;
    sessionId = null;
    clearTimeout(mutationTimer);
    if (mutationObserver) {
      mutationObserver.disconnect();
      mutationObserver = null;
    }
    document.removeEventListener("click", handleTrustedInteraction, true);
    document.removeEventListener("change", handleTrustedInteraction, true);
    chrome.runtime.onMessage.removeListener(handleRuntimeMessage);
    observerInstance.active = false;
    if (globalThis.__MODEL_LIVE_WEBPAGE_OBSERVER__ === observerInstance) {
      delete globalThis.__MODEL_LIVE_WEBPAGE_OBSERVER__;
    }
  }

  observerInstance.dispose = stopLocally;

  async function reportLocalFailure(code) {
    const failedSessionId = sessionId;
    if (!failedSessionId || stopped) {
      stopLocally();
      return { ok: false, code };
    }
    try {
      await chrome.runtime.sendMessage({
        type: "local-observation-error",
        sessionId: failedSessionId,
        code
      });
    } catch (_error) {
      // The failure remains local and observation stops below.
    } finally {
      stopLocally();
    }
    return { ok: false, code };
  }

  function handleRuntimeMessage(message, _sender, sendResponse) {
    if (!message || typeof message !== "object") {
      return;
    }
    if (message.type === "observe-now") {
      capture("manual").then(sendResponse, () => sendResponse({ ok: false, code: "OBSERVATION_FAILED" }));
      return true;
    }
    if (message.type === "stop-content") {
      clearTimeout(mutationTimer);
      capture("final").then((result) => {
        stopLocally();
        sendResponse({
          ok: true,
          flushed: Boolean(result && result.ok === true),
          flushCode: result && result.ok !== true ? result.code || "FINAL_OBSERVATION_FAILED" : null
        });
      }, () => {
        stopLocally();
        sendResponse({ ok: true, flushed: false, flushCode: "FINAL_OBSERVATION_FAILED" });
      });
      return true;
    }
    if (message.type === "abort-content") {
      stopLocally();
      sendResponse({ ok: true, aborted: true });
      return;
    }
    if (message.type === "ping-content") {
      sendResponse({ ok: true, active: !stopped && Boolean(sessionId), sessionId });
    }
  }

  chrome.runtime.onMessage.addListener(handleRuntimeMessage);

  chrome.runtime.sendMessage({ type: "content-ready" }).then((response) => {
    if (!response || response.active !== true || typeof response.sessionId !== "string") {
      return;
    }
    sessionId = response.sessionId;
    stopped = false;
    mutationObserver = new MutationObserver(queueMutationCapture);
    mutationObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true
    });
    document.addEventListener("click", handleTrustedInteraction, true);
    document.addEventListener("change", handleTrustedInteraction, true);
    capture("initial");
  }).catch(stopLocally);
})();
