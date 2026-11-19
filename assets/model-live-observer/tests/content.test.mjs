import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
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
  const listeners = new Set();
  return {
    addListener(listener) { listeners.add(listener); },
    removeListener(listener) { listeners.delete(listener); },
    fire(message) {
      return new Promise((resolve) => {
        for (const listener of listeners) {
          listener(message, {}, resolve);
          return;
        }
        resolve(undefined);
      });
    }
  };
}

class FakeNode {
  constructor(nodeType) {
    this.nodeType = nodeType;
    this.firstChild = null;
    this.nextSibling = null;
  }
}

class FakeText extends FakeNode {
  constructor(data) {
    super(3);
    this.data = data;
  }
}

class FakeComment extends FakeNode {
  constructor(data) {
    super(8);
    this.data = data;
  }
}

class FakeElement extends FakeNode {
  constructor(tagName, options = {}) {
    super(1);
    this.tagName = tagName.toUpperCase();
    this.id = options.id || "";
    this.classList = options.classNames || [];
    this.actionable = options.actionable === true;
    this.attributeMap = new Map(Object.entries(options.attributes || {}));
    this.lastChild = null;
  }
  append(...nodes) {
    for (const node of nodes) {
      if (this.lastChild) this.lastChild.nextSibling = node;
      else this.firstChild = node;
      node.parentElement = this;
      this.lastChild = node;
    }
    return this;
  }
  get attributes() { return Array.from(this.attributeMap, ([name, value]) => ({ name, value })); }
  hasAttribute(name) { return this.attributeMap.has(name); }
  getAttribute(name) { return this.attributeMap.get(name) ?? null; }
  closest(selector) {
    for (let element = this; element; element = element.parentElement) {
      if (selector === "[contenteditable],[role='textbox']") {
        if (element.hasAttribute("contenteditable") || element.getAttribute("role") === "textbox") return element;
      } else if (element.actionable) {
        return element;
      }
    }
    return null;
  }
  get textContent() {
    let value = "";
    for (let node = this.firstChild; node; node = node.nextSibling) {
      value += node.nodeType === 3 ? node.data : node.textContent || "";
    }
    return value;
  }
}

class FakeMutationObserver {
  constructor(callback) { this.callback = callback; }
  observe() {}
  disconnect() {}
}

function waitFor(predicate, timeoutMs = 1500) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      if (predicate()) resolve();
      else if (Date.now() - started > timeoutMs) reject(new Error("timed out waiting for observation"));
      else setTimeout(check, 5);
    };
    check();
  });
}

function createHarness(options = {}) {
  const messages = [];
  const listeners = new Map();
  const onMessage = eventSlot();
  const html = new FakeElement("html", { attributes: { lang: "en", "data-page": "1" } });
  const body = new FakeElement("body");
  body.scrollWidth = body.offsetWidth = 1600;
  body.scrollHeight = body.offsetHeight = 5000;
  html.scrollWidth = html.offsetWidth = 1600;
  html.scrollHeight = html.offsetHeight = 5000;
  const link = new FakeElement("a", {
    attributes: {
      href: "/records?page=2&_gl=tracking",
      onclick: "evil()",
      src: "https://tracker.example/pixel.png",
      "data-page": "2",
      "data-value": "private form choice",
      "data-session-token": "not-allowed"
    }
  }).append(new FakeText(options.hugeText ? "x".repeat(policy.MAX_RAW_TEXT_CHARS + 100) : "Visible record"));
  if (options.hugeAttribute) link.attributeMap.set("data-id", "z".repeat(policy.MAX_RAW_ATTRIBUTE_CHARS + 100));
  body.append(
    new FakeElement("script").append(new FakeText("evil()")),
    new FakeElement("div", { attributes: { contenteditable: "true" } }).append(new FakeText("editable")),
    new FakeComment("hidden"),
    new FakeText("eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJmaXh0dXJlIn0.signature12345"),
    link
  );
  for (let index = 0; index < (options.extraNodes || 0); index += 1) {
    body.append(new FakeElement("span").append(new FakeText(`row ${index}`)));
  }
  html.append(body);

  const action = new FakeElement("button", {
    actionable: true,
    id: "next-page",
    classNames: ["pager", "next"],
    attributes: { role: "button", "aria-label": "Next page", "data-page": "2", value: "never-capture" }
  }).append(
    new FakeText("Next page"),
    new FakeElement("span", { attributes: { contenteditable: "true" } })
      .append(new FakeText("editable private interaction text")),
    new FakeElement("span", { attributes: { role: "textbox" } })
      .append(new FakeText("textbox private interaction text"))
  );
  if (options.editableInteractionRoot) {
    action.attributeMap.set("contenteditable", "true");
  }
  if (options.editableInteractionAncestor) {
    new FakeElement("div", { attributes: { role: "textbox" } }).append(action);
  }
  if (options.hostileInteractionSurface) {
    const access = { attributes: 0, classes: 0, textContent: 0 };
    Object.defineProperty(action, "attributes", {
      configurable: true,
      value: new Proxy({ length: 1000000 }, {
        get(target, property) {
          if (property === "length") return target.length;
          if (/^\d+$/.test(String(property))) {
            access.attributes += 1;
            const index = Number(property);
            return { name: `data-extra-${index}`, value: `value-${index}` };
          }
          return target[property];
        }
      })
    });
    action.classList = new Proxy({ length: 1000000 }, {
      get(target, property) {
        if (property === "length") return target.length;
        if (/^\d+$/.test(String(property))) {
          access.classes += 1;
          return `class-${property}`;
        }
        return target[property];
      }
    });
    Object.defineProperty(action, "textContent", {
      configurable: true,
      get() {
        access.textContent += 1;
        throw new Error("unbounded textContent access");
      }
    });
    action.boundAccess = access;
  }
  const document = {
    title: "Example records",
    readyState: "complete",
    body,
    documentElement: html,
    addEventListener(type, listener) { listeners.set(type, listener); },
    removeEventListener(type, listener) { if (listeners.get(type) === listener) listeners.delete(type); }
  };
  const activePolicy = {
    ...policy,
    MUTATION_DEBOUNCE_MS: 5,
    INTERACTION_SNAPSHOT_DELAY_MS: 5,
    MAX_CAPTURE_NODES: options.maxNodes || policy.MAX_CAPTURE_NODES
  };
  const chrome = {
    runtime: {
      onMessage,
      async sendMessage(message) {
        messages.push(structuredClone(message));
        if (message.type === "content-ready") {
          return { active: true, sessionId: "22222222-2222-4222-8222-222222222222" };
        }
        return { ok: true, stored: true };
      }
    }
  };
  const context = vm.createContext({
    chrome,
    console,
    crypto: webcrypto,
    TextEncoder,
    TextDecoder,
    Element: FakeElement,
    MutationObserver: FakeMutationObserver,
    document,
    location: { href: "https://example.com/records?page=1&_gl=tracking" },
    window: { innerWidth: 1600, innerHeight: 900, scrollX: 0, scrollY: 100, devicePixelRatio: 1.25 },
    setTimeout,
    clearTimeout,
    structuredClone,
    ModelLiveObserverPolicy: activePolicy
  });
  vm.runInContext(fs.readFileSync(path.join(extensionRoot, "observer-content.js"), "utf8"), context, {
    filename: "observer-content.js"
  });
  return { action, context, listeners, messages, onMessage };
}

test("initial observation uses bounded traversal and structurally sanitizes untrusted content", async () => {
  const harness = createHarness();
  await waitFor(() => harness.messages.some((message) => message.type === "observation"));
  const snapshot = harness.messages.find((message) => message.type === "observation").observation;
  assert.equal(policy.validateObservation(snapshot), true);
  assert.equal(snapshot.sourceTrust, "untrusted-page-content");
  assert.equal(snapshot.sanitizedHtml.includes("Visible record"), true);
  for (const rejected of ["<script>", "signature12345", "onclick", "src=", "data-session-token", "private form choice", "_gl="]) {
    assert.equal(snapshot.sanitizedHtml.includes(rejected), false, rejected);
  }
  assert.equal(snapshot.redactions.removedElements, 1);
  assert.equal(snapshot.redactions.removedContentEditable, 1);
  assert.equal(snapshot.redactions.removedComments, 1);
  assert.equal(snapshot.redactions.removedCredentialTextNodes, 1);
});

test("raw text, attribute, and node limits apply before unbounded cloning or serialization", async () => {
  for (const options of [{ hugeText: true }, { hugeAttribute: true }, { extraNodes: 20, maxNodes: 6 }]) {
    const harness = createHarness(options);
    await waitFor(() => harness.messages.some((message) => message.type === "observation"));
    const snapshot = harness.messages.find((message) => message.type === "observation").observation;
    assert.equal(snapshot.truncated, true);
    assert.equal(snapshot.byteLength <= policy.MAX_CAPTURE_BYTES, true);
    assert.equal(snapshot.sanitizedHtml.length < policy.MAX_CAPTURE_BYTES, true);
  }
});

test("only trusted interactions are described and form values are absent", async () => {
  const harness = createHarness();
  await waitFor(() => harness.messages.some((message) => message.type === "observation"));
  const click = harness.listeners.get("click");
  click({ isTrusted: false, type: "click", target: harness.action });
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(harness.messages.some((message) => message.observation?.kind === "interaction"), false);
  click({ isTrusted: true, type: "click", target: harness.action });
  await waitFor(() => harness.messages.some((message) => message.observation?.kind === "interaction"));
  const interaction = harness.messages.find((message) => message.observation?.kind === "interaction").observation;
  assert.equal(policy.validateObservation(interaction), true);
  assert.equal(JSON.stringify(interaction).includes("never-capture"), false);
  assert.equal(JSON.stringify(interaction).includes("private interaction text"), false);
});

test("interaction descriptors bound attributes, classes, and descendant text before allocation", async () => {
  const harness = createHarness({ hostileInteractionSurface: true });
  await waitFor(() => harness.messages.some((message) => message.type === "observation"));
  const click = harness.listeners.get("click");
  click({ isTrusted: true, type: "click", target: harness.action });
  await waitFor(() => harness.messages.some((message) => message.observation?.kind === "interaction"));
  const interaction = harness.messages.find((message) => message.observation?.kind === "interaction").observation;
  assert.equal(policy.validateObservation(interaction), true);
  assert.equal(harness.action.boundAccess.attributes <= policy.MAX_DATA_ATTRIBUTES, true);
  assert.equal(harness.action.boundAccess.classes, 16);
  assert.equal(harness.action.boundAccess.textContent, 0);
  assert.equal(interaction.target.text, "Next page");
});

test("editable interaction roots and ancestors never expose their text", async () => {
  for (const options of [{ editableInteractionRoot: true }, { editableInteractionAncestor: true }]) {
    const harness = createHarness(options);
    await waitFor(() => harness.messages.some((message) => message.type === "observation"));
    const click = harness.listeners.get("click");
    click({ isTrusted: true, type: "click", target: harness.action });
    await waitFor(() => harness.messages.some((message) => message.observation?.kind === "interaction"));
    const interaction = harness.messages.find((message) => message.observation?.kind === "interaction").observation;
    assert.equal(policy.validateObservation(interaction), true);
    assert.equal(interaction.target.text, null);
    assert.equal(JSON.stringify(interaction).includes("private interaction text"), false);
  }
});
