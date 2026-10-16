# Runtime Messaging and Events

> Manifest V3 API examples are fragments: run awaited calls inside an async handler and supply the shown input variables. Register worker listeners synchronously at startup; each API heading links to its official contract.

## Overview
This reference covers runtime messaging, install/startup events, manifest and URL helpers, and shared event-listener contracts. Runtime methods have different return styles: some are synchronous, others support Promises or callbacks. Scheduling, idle and power APIs are in the linked companion reference.

## [chrome.runtime](https://developer.chrome.com/docs/extensions/reference/api/runtime)
- **Purpose:** inspect the running extension (manifest, ID, URL resolution, platform info), respond to lifecycle moments, and pass messages between extension contexts or to native hosts.
- **Permission:** none for most members. `connectNative()`, `sendNativeMessage()`, and `onConnectNative` require `"nativeMessaging"`.
- **Key methods** (MV3 returns Promises; the connect helpers return synchronously):
  - `connect(extensionId?, connectInfo?)` → returns a `Port`
  - `connectNative(application)` → returns a `Port`
  - `getContexts(filter)` → resolves to `ExtensionContext[]`
  - `getManifest()` → returns the manifest `object` (synchronous)
  - `getPlatformInfo()` → resolves to `PlatformInfo`
  - `getURL(path)` → returns a `string` (synchronous)
  - `openOptionsPage()` → resolves when the options page opens
  - `reload()` → reloads the extension (synchronous)
  - `requestUpdateCheck()` → resolves to an update-check result `object`
  - `sendMessage(extensionId?, message, options?)` → resolves to the response
  - `sendNativeMessage(application, message)` → resolves to the host reply
  - `setUninstallURL(url)` → resolves when set
- **Key events:** `onConnect`, `onConnectExternal`, `onConnectNative`, `onInstalled` (details `{reason, previousVersion?, id?}`), `onMessage` (`(message, sender, sendResponse)` — return `true` to keep `sendResponse` valid for an async reply), `onMessageExternal`, `onStartup`, `onUpdateAvailable` (details `{version}`), `onUserScriptConnect`, `onUserScriptMessage`.
- **Key types:** `Port` (`name`, `onMessage`, `onDisconnect`, `sender?`, `postMessage(message)`, `disconnect()`); `MessageSender` (`id?`, `nativeApplication?`, `origin?`, `tab?`, `url?`, `frameId?`, `documentId?`, `documentLifecycle?`, `tlsChannelId?`); properties `runtime.id` and `runtime.lastError` (only meaningful inside a callback). Enums: `OnInstalledReason` = `"install"`, `"update"`, `"chrome_update"`, `"shared_module_update"`; `ContextType` (Chrome 114+) = `"TAB"`, `"POPUP"`, `"BACKGROUND"`, `"OFFSCREEN_DOCUMENT"`, `"SIDE_PANEL"`, `"DEVELOPER_TOOLS"`; `PlatformOs` = `"mac"`, `"win"`, `"android"`, `"cros"`, `"linux"`, `"openbsd"`; `PlatformArch` = `"arm"`, `"arm64"`, `"x86-32"`, `"x86-64"`, `"mips"`, `"mips64"`, `"riscv64"`; `RequestUpdateCheckStatus` = `"throttled"`, `"no_update"`, `"update_available"`.
- **MV3 notes:** there is no background page, so `getBackgroundPage()` is gone — use the service worker plus message passing. Reloading an unpacked extension (or calling `reload()`) re-fires `onInstalled` with reason `"update"`, so guard install-only work. Returning `true` from an `onMessage` listener keeps the channel open for a deferred `sendResponse`.

```js
// service-worker.js
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.runtime.setUninstallURL("https://example.com/uninstall-survey");
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ping") {
    queueMicrotask(() => sendResponse({ pong: true }));
    return true; // keep the channel open for the async sendResponse
  }
});
```

## [chrome.events](https://developer.chrome.com/docs/extensions/reference/api/events)
- **Purpose:** the shared shape behind every dispatched event — both ordinary listeners and declarative rule sets.
- **Permission:** none.
- **Key methods:** on each `Event` object — `addListener(callback)`, `removeListener(callback)`, `hasListener(callback)`, `hasListeners()`. For declarative APIs: `addRules(rules, callback?)`, `removeRules(ruleIdentifiers?, callback?)`, `getRules(ruleIdentifiers?, callback)`.
- **Key types:** `Rule` = `{id?, priority? (default 100), conditions[], actions[], tags?}`. `UrlFilter` matches with `hostEquals`/`hostPrefix`/`hostSuffix`/`hostContains`, `pathEquals`/`pathPrefix`/`pathSuffix`/`pathContains`, `queryEquals`/`queryPrefix`/`querySuffix`/`queryContains`, `urlEquals`/`urlPrefix`/`urlSuffix`/`urlContains`/`urlMatches`, `originAndPathMatches`, `schemes`, `ports` (number or array, e.g. `[80, 443, [1000, 1200]]`), and `cidrBlocks` (Chrome 123+).
- **MV3 notes:** declarative rules persist across sessions, so register them inside `runtime.onInstalled` and clear stale rules first. Passing a filter as the second argument to `addListener` lets the browser skip waking the service worker for irrelevant events.

```js
// Filtered listener: only wake for one host.
chrome.webNavigation.onCommitted.addListener(
  (details) => console.log("committed:", details.url),
  { url: [{ hostSuffix: "example.com" }] }
);
```


For timers, idle state and power requests, read [Alarms, idle and power](alarms-idle-power.md).
