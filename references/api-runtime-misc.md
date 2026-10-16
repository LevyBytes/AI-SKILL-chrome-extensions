# Offscreen, Messaging Services & Shared Type Namespaces

> Manifest V3 API examples are fragments: run awaited calls inside an async handler and supply the shown input variables. Register worker listeners synchronously at startup; each API heading links to its official contract.

## Overview
This cluster gathers the remaining runtime-adjacent APIs: `chrome.offscreen` (DOM access for a service worker), the cloud-messaging pair `chrome.gcm` and `chrome.instanceID`, the partly-legacy `chrome.extension` utilities, two declaration namespaces — `chrome.types` and `chrome.extensionTypes` — and the callable `chrome.dom` helper.

Open when creating, sharing or closing an offscreen document without duplicate-creation races. [Offscreen Document Lifecycle](offscreen-document-lifecycle.md).

## [chrome.gcm](https://developer.chrome.com/docs/extensions/reference/api/gcm)
- **Purpose:** send and receive push messages through Firebase Cloud Messaging (FCM).
- **Permission:** `"gcm"`.
- **Key methods** (Promises): `register(senderIds)` accepts 1–100 sender IDs and resolves to a registration ID; `send(message)` resolves to a message ID; `unregister()`. The `send` message object carries `data` (keys may not start with `goog.`, `google`, or `collapse_key`), `destinationId`, `messageId`, and optional `timeToLive` (seconds in the range 0–2,419,200, default 86,400).
- **Key events:** `onMessage` (`{data, from?, collapseKey?}`), `onMessagesDeleted`, `onSendError` (`{errorMessage, messageId?, details?}`).
- **Constants:** `MAX_MESSAGE_SIZE` = 4096 bytes (sum of all key/value pairs).
- **MV3 notes:** all methods are Promise-based. Register listeners at the top level so an incoming push can wake the worker.

```js
chrome.gcm.onMessage.addListener((message) => console.log("push:", message.data));
// Invoke registration from an async setup handler after listener registration.
const registrationId = await chrome.gcm.register(["SENDER_ID_PLACEHOLDER"]);
```

## [chrome.instanceID](https://developer.chrome.com/docs/extensions/reference/api/instanceID)
- **Purpose:** obtain a stable per-instance identifier and scoped tokens (used with FCM).
- **Permission:** `"gcm"`.
- **Key methods** (Promises): `getID()`; `getCreationTime()`; `getToken(getTokenParams)` (params `authorizedEntity`, `scope`, and a deprecated `options` ignored since Chrome 89); `deleteToken(deleteTokenParams)` (params `authorizedEntity`, `scope`); `deleteID()`.
- **Key events:** `onTokenRefresh` — fires when all granted tokens need to be re-fetched.
- **MV3 notes:** `deleteID()` resets the instance ID and invalidates every derived token, so re-acquire tokens afterward; treat `onTokenRefresh` as the cue to call `getToken` again.

```js
const id = await chrome.instanceID.getID();
const token = await chrome.instanceID.getToken({
  authorizedEntity: "PROJECT_ID_PLACEHOLDER",
  scope: "GCM",
});
```

## [chrome.extension](https://developer.chrome.com/docs/extensions/reference/api/extension)
- **Purpose:** a grab-bag of helpers usable from any extension page; in MV3 most of its messaging surface moved to `chrome.runtime`.
- **Permission:** none.
- **Key methods** (current in MV3): `getURL(path)` (prefer `chrome.runtime.getURL`); `getViews(fetchProperties?)` → returns `Window[]`; `isAllowedIncognitoAccess()` (Chrome 99+); `isAllowedFileSchemeAccess()` (Chrome 99+); `setUpdateUrlData(data)`.
- **Key types:** `ViewType` = `"tab"`, `"popup"` (Chrome 44+); property `inIncognitoContext`.
- **Migration context only** (deprecated MV2-era — do not use in new MV3 code): `getBackgroundPage()`, `getExtensionTabs()`, `sendRequest()` (use `chrome.runtime.sendMessage()`), `onRequest` (use `chrome.runtime.onMessage`), `onRequestExternal` (use `chrome.runtime.onMessageExternal`), and `lastError` (use `chrome.runtime.lastError`).

```js
const allowed = await chrome.extension.isAllowedIncognitoAccess();
console.log("incognito allowed:", allowed, "in incognito:", chrome.extension.inIncognitoContext);
```

## [chrome.types](https://developer.chrome.com/docs/extensions/reference/api/types)
- **Purpose:** a declarations-only namespace; its central contribution is the `ChromeSetting` type that other APIs (such as `chrome.privacy` and `chrome.accessibilityFeatures`) expose to read and control a browser setting.
- **Permission:** none.
- **Key methods** (on a `ChromeSetting` object, Promise-based, Chrome 96+): `get(details)`; `set(details)`; `clear(details)`.
- **Key events:** `onChange` → `(details {value, levelOfControl, incognitoSpecific?})`.
- **Key types:** `ChromeSettingScope` = `"regular"`, `"regular_only"`, `"incognito_persistent"`, `"incognito_session_only"`; `LevelOfControl` = `"not_controllable"`, `"controlled_by_other_extensions"`, `"controllable_by_this_extension"`, `"controlled_by_this_extension"`.
- **MV3 notes:** `chrome.types` has no callable members of its own — you reach a `ChromeSetting` through another API. The most recently installed controlling extension wins; check `levelOfControl` before assuming a `set` will stick.

```js
const setting = chrome.privacy.network.networkPredictionEnabled; // a ChromeSetting
const details = await setting.get({});
if (details.levelOfControl === "controllable_by_this_extension") {
  await setting.set({ value: false, scope: "regular" });
}
```

## [chrome.extensionTypes](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes)
- **Purpose:** a types-only namespace holding common enums and option shapes shared by several APIs (no methods, no events).
- **Permission:** none.
- **Key types / enums:** `ImageFormat` = `"jpeg"`, `"png"`; `ImageDetails` = `{format? (default "jpeg"), quality? (JPEG only)}`; `CSSOrigin` = `"author"`, `"user"`; `RunAt` = `"document_start"`, `"document_end"`, `"document_idle"` (default); `DocumentLifecycle` (Chrome 106+) = `"prerender"`, `"active"`, `"cached"`, `"pending_deletion"`; `FrameType` (Chrome 106+) = `"outermost_frame"`, `"fenced_frame"`, `"sub_frame"`; `ExecutionWorld` (Chrome 111+) = `"ISOLATED"`, `"MAIN"`, `"USER_SCRIPT"`; `InjectDetails` (`code` or `file`, plus `frameId`, `allFrames`, `matchAboutBlank`, `runAt`, `cssOrigin`); `ColorArray` (Chrome 139+) = `[number, number, number, number]`.
- **MV3 notes:** nothing to import or call — these names appear as the parameter/return types of methods on APIs like `chrome.scripting`, `chrome.tabs`, and `chrome.userScripts`.

## [chrome.dom](https://developer.chrome.com/docs/extensions/reference/api/dom)
- **Purpose:** special DOM helpers available to content scripts beyond the standard web platform.
- **Permission:** none.
- **Key methods:** `openOrClosedShadowRoot(element)` → returns the element's `ShadowRoot` (or `null`) — notably it can reach a *closed* shadow root that page script could not.
- **MV3 notes:** added Chrome 88+. Meant for the content-script context where there is a real DOM.

```js
// content script
const host = document.querySelector("#widget");
const root = host ? chrome.dom.openOrClosedShadowRoot(host) : null;
if (root) console.log("shadow children:", root.childElementCount);
```
