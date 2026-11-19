Related section: [Tab management](overview.md).
## Events

```js
chrome.tabs.onCreated.addListener((tab) => { /* new tab */ });
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => { /* tab changed */ });
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => { /* tab closed */ });
chrome.tabs.onActivated.addListener(({ tabId, windowId }) => { /* tab focused */ });
chrome.tabGroups.onUpdated.addListener((group) => { /* group changed */ });
```

## Windows

⚠️ **`chrome.windows` has NO `.query()` method.** Unlike `chrome.tabs.query()`, there is no
`chrome.windows.query()`. Use the correct method for your need:

```js
// ❌ BROKEN
const windows = await chrome.windows.query({ focused: true });
// TypeError: chrome.windows.query is not a function

// ✅ CORRECT
const focused = await chrome.windows.getLastFocused({ populate: true }); // includes tabs array
const current = await chrome.windows.getCurrent({ populate: true });
const all     = await chrome.windows.getAll({ populate: true });
const single  = await chrome.windows.get(windowId, { populate: true });
```

Full API: `getAll`, `getLastFocused`, `getCurrent`, `get(windowId)`, `create`, `update`, `remove`.
Pass `{ populate: true }` to include the `tabs` array on the returned window object.

```js
// Create a new window with specific tabs
const win = await chrome.windows.create({ url: 'https://example.com', focused: true });

// Move current window to a specific position/size
await chrome.windows.update(windowId, { left: 0, top: 0, width: 800, height: 600 });

// Minimise / maximise
await chrome.windows.update(windowId, { state: 'minimized' }); // 'normal' | 'minimized' | 'maximized' | 'fullscreen'
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/skills-src/chrome-extensions/references/extensions/tab-management.md#L93-L132). [Upstream licensing terms](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/README.md#license). Reorganized for this edition.
