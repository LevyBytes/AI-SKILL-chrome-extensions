# MV2 to MV3 Migration

> Manifest V3 API examples are fragments: run awaited calls inside an async handler and supply the shown input variables. Register worker listeners synchronously at startup; each API heading links to its official contract. MV2 appears here only as labeled migration context.

## Overview
The concrete OLD-to-NEW changes to convert a Manifest V2 extension to Manifest V3 (supported in Chrome 88+).

## Manifest changes

| Concern | OLD (MV2) | NEW (MV3) |
|---|---|---|
| Manifest version | `"manifest_version": 2` | `"manifest_version": 3` |
| Background | `"background": { "scripts": [...], "persistent": false }` | `"background": { "service_worker": "...", "type": "module" }` |
| Toolbar UI | `browser_action` / `page_action` | `action` |
| Permissions | single `permissions` array | `permissions` + `host_permissions` (split) |
| CSP | string | object with `extension_pages` and `sandbox` |
| Remote code | allowed | prohibited (bundle all code) |

For background: replace the `scripts` array with one `service_worker` string, remove `persistent`, and add `"type": "module"` only if using ES module imports.

## API changes

| Concern | OLD (MV2) | NEW (MV3) |
|---|---|---|
| Inject script | `chrome.tabs.executeScript(tab.id, {file: 'content-script.js'})` | `chrome.scripting.executeScript({target: {tabId: tab.id}, files: ['content-script.js']})` |
| Inject/remove CSS | `chrome.tabs.insertCSS` / `chrome.tabs.removeCSS` | `chrome.scripting.insertCSS` / `chrome.scripting.removeCSS` |
| Toolbar click | `chrome.browserAction.onClicked` / `chrome.pageAction.onClicked` | `chrome.action.onClicked` |
| Blocking network | blocking `webRequest` listeners | `declarativeNetRequest` |
| Async style | callbacks | Promises where supported; chrome.* callbacks remain available |
| Network fetch | `XMLHttpRequest` | global `fetch()` |
| Background page handle | `chrome.runtime.getBackgroundPage` / `chrome.extension.getBackgroundPage` | message passing (`sendMessage` / `onMessage`) |
| Connect/message | `chrome.extension.sendMessage()`, `chrome.tabs.sendRequest()` | `chrome.runtime.sendMessage()`, `chrome.runtime.connect()` |

The `scripting` API calls require the `"scripting"` permission plus host permissions or `"activeTab"`.

## Background page to service worker
The service worker replaces the MV2 background/event page. Required adjustments:
- **No DOM or `window`**: move DOM work to an offscreen document via messaging.
- **Register listeners synchronously at the top level**, not nested inside callbacks/promises.
- **No persistent global state**: replace in-memory globals and `localStorage` with `chrome.storage.local`.
- **Replace timers**: swap `setTimeout`/`setInterval` for `chrome.alarms`.

```js
// handleActionClick is your application handler; choose one registration pattern.
// OLD
chrome.storage.local.get(["badgeText"], ({ badgeText }) => {
  chrome.action.onClicked.addListener(handleActionClick);
});
// NEW
chrome.action.onClicked.addListener(handleActionClick);
chrome.storage.local.get(["badgeText"], ({ badgeText }) => {
  chrome.action.setBadgeText({ text: badgeText ?? "" });
});
```

## Security changes to apply
`eval()` and `new Function()` are not allowed in extension pages. Move `executeScript` from the `tabs` namespace to the `scripting` namespace. Eliminate remotely hosted code by bundling all JS, WASM, and CSS and referencing it with `chrome.runtime.getURL()`. Convert the `content_security_policy` string into the object form with `extension_pages` (and `sandbox` if needed); the extension-page minimum is `script-src 'self' 'wasm-unsafe-eval'; object-src 'self';`, with stricter policies allowed. The wasm keyword applies to script-src. Remote CSS is not itself remotely hosted executable code, though CSP still governs its loading.
