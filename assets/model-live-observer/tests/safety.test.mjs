import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testRoot = path.dirname(fileURLToPath(import.meta.url));
const taskRoot = path.resolve(testRoot, "..");
const extensionRoot = path.join(taskRoot, "extension");
const bridgeRoot = path.join(taskRoot, "bridge");
const manifest = JSON.parse(fs.readFileSync(path.join(extensionRoot, "manifest.json"), "utf8"));
const worker = fs.readFileSync(path.join(extensionRoot, "service-worker.js"), "utf8");
const content = fs.readFileSync(path.join(extensionRoot, "observer-content.js"), "utf8");
const bridge = fs.readFileSync(path.join(bridgeRoot, "live-observer-bridge.mjs"), "utf8");
const popup = fs.readFileSync(path.join(extensionRoot, "popup.html"), "utf8");

test("manifest grants exact-tab observation, explicit debugger capture and the loopback bridge", () => {
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual([...manifest.permissions].sort(), ["activeTab", "debugger", "scripting", "storage"].sort());
  assert.deepEqual(manifest.host_permissions, ["http://127.0.0.1/*"]);
  assert.match(manifest.content_security_policy.extension_pages, /connect-src http:\/\/127\.0\.0\.1:\*/);
  for (const forbiddenKey of [
    "optional_host_permissions",
    "content_scripts",
    "externally_connectable",
    "devtools_page",
    "declarative_net_request",
    "web_accessible_resources"
  ]) {
    assert.equal(Object.hasOwn(manifest, forbiddenKey), false, forbiddenKey);
  }
});

test("bridge transport is hardcoded loopback and debugger use is pinned to Network capture", () => {
  assert.match(worker, /http:\/\/127\.0\.0\.1:\$\{policy\.CONFIG\.bridgePort\}/);
  assert.match(worker, /\/v1\/connect/);
  assert.match(worker, /credentials: "omit"/);
  assert.match(worker, /redirect: "error"/);
  assert.match(worker, /referrerPolicy: "no-referrer"/);
  assert.equal(/fetch\(message\./.test(worker), false);
  assert.equal(/fetch\(observation\./.test(worker), false);
  assert.match(worker, /X-Model-Observer-Auth/);
  assert.equal(worker.includes("X-Model-Observer-Token"), false);
  for (const forbidden of [
    "chrome.cookies",
    "chrome.webRequest",
    "declarativeNetRequest",
    "onMessageExternal",
    "onConnectExternal",
    "XMLHttpRequest",
    "WebSocket"
  ]) {
    assert.equal(worker.includes(forbidden), false, forbidden);
  }
  assert.match(worker, /chrome\.debugger\.attach\(\{ tabId: session\.tabId \}, "1\.3"\)/);
  assert.match(worker, /"Network\.getRequestPostData"/);
  assert.match(worker, /"Network\.getResponseBody"/);
  assert.match(worker, /chrome\.debugger\.detach\(\{ tabId: session\.tabId \}\)/);
  for (const forbiddenCommand of [
    "Input.",
    "Page.navigate",
    "Runtime.evaluate",
    "Network.getCookies",
    "Storage.getCookies",
    "Fetch.enable"
  ]) {
    assert.equal(worker.includes(forbiddenCommand), false, forbiddenCommand);
  }
  assert.match(worker, /\["cookie", "set-cookie"\]\.includes\(name\.toLowerCase\(\)\)/);
});

test("content observer cannot control the page or collect browser and form secrets", () => {
  for (const forbidden of [
    ".click(",
    "dispatchEvent(",
    "scrollTo(",
    "scrollBy(",
    "location.assign",
    "location.replace",
    "document.cookie",
    "localStorage",
    "sessionStorage"
  ]) {
    assert.equal(content.includes(forbidden), false, forbidden);
  }
  assert.equal(/\b(?:element|target)\.value\b/.test(content), false, "form-control value access");
  assert.match(content, /event\.isTrusted !== true/);
  assert.match(content, /new Set\(policy\.REMOVED_ELEMENTS\)/);
  assert.match(content, /removedCredentialTextNodes/);
  assert.equal(content.includes("cloneNode("), false);
  assert.match(content, /sourceTrust: policy\.SOURCE_TRUST/);
  assert.equal(content.includes("attributeFilter"), false);
});

test("bridge has automatic connect and ingest surfaces, binds IPv4 loopback and has no reverse channel", () => {
  assert.match(bridge, /server\.listen\(\{ host: "127\.0\.0\.1"/);
  assert.match(bridge, /\["\/v1\/connect", "\/v1\/ingest"\]/);
  assert.equal(bridge.includes("Connection token:"), false);
  assert.equal(bridge.includes("connectionToken:"), false);
  assert.equal(bridge.includes("process.env"), false);
  assert.equal(bridge.includes("--token"), false);
  assert.equal(bridge.includes("child_process"), false);
  assert.equal(bridge.includes("exec("), false);
  assert.equal(bridge.includes("spawn("), false);
  assert.equal(bridge.includes("eval("), false);
  assert.equal(bridge.includes("new Function"), false);
});

test("popup exposes explicit Start, Observe now and Stop controls", () => {
  assert.match(popup, /<button id="start" type="button">Start live research<\/button>/);
  assert.match(popup, /<button id="observe" type="button">Observe now<\/button>/);
  assert.match(popup, /<button id="stop" type="button">Stop<\/button>/);
  assert.equal(popup.includes('type="password"'), false);
  assert.equal(popup.includes('id="bridge-port"'), false);
  assert.equal(popup.includes('id="bridge-token"'), false);
  assert.match(popup, /No username, port, token, or account binding entry is required/);
  assert.match(popup, /Sensitive local evidence includes GraphQL queries/);
  assert.match(popup, /excludes cookie headers/);
});

test("all source and test files are BOM-less LF", () => {
  const roots = [extensionRoot, bridgeRoot, testRoot];
  const files = roots.flatMap((root) => fs.readdirSync(root)
    .map((name) => path.join(root, name))
    .filter((fullPath) => fs.statSync(fullPath).isFile()));
  for (const file of files) {
    const bytes = fs.readFileSync(file);
    assert.equal(bytes.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf])), false, file);
    assert.equal(bytes.includes(0x0d), false, file);
  }
});
