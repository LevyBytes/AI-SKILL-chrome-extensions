Related section: [Long-lived connections (ports)](long-lived-connections-ports.md).
# Message Passing

## Basic patterns

### One-way message (fire and forget)

```js
// sender (popup, content script, etc.)
chrome.runtime.sendMessage({ type: 'LOG', data: 'hello' });

// receiver (service worker)
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'LOG') console.log(message.data);
});
```

### Request/response — IIFE + return true (most compatible)

```js
// sender
const response = await chrome.runtime.sendMessage({ type: 'GET_DATA' });
console.log(response.data);

// receiver — IIFE keeps the channel open until sendResponse is called
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_DATA') {
    (async () => {
      const data = await chrome.storage.local.get('key');
      sendResponse({ data });
    })();
    return true; // REQUIRED — tells Chrome to keep the channel open
  }
});
```

### Request/response — return a Promise (Chrome 99+)

Returning a Promise directly from the listener is now supported and cleaner than the IIFE pattern:

```js
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'GET_DATA') {
    return chrome.storage.local.get('key'); // returned promise resolves the response
  }
  // Return nothing (or undefined) for messages this listener doesn't handle
});
```

**Note:** Requires Chrome 99+, only use when minimum Chrome version is set to 99.
**Note:** Do NOT mix the two styles. If you return a Promise, do NOT also call `sendResponse` or `return true`.

## Content script ↔ service worker

```js
// content script → service worker
const result = await chrome.runtime.sendMessage({ type: 'FETCH_DATA', url: location.href });

// service worker → specific tab's content script
await chrome.tabs.sendMessage(tabId, { type: 'HIGHLIGHT', selector: '.important' });
```

## Service worker → content script (targeted)

Always check that the tab exists and the content script is injected:

```js
async function sendToContentScript(tabId, message) {
  try {
    return await chrome.tabs.sendMessage(tabId, message);
  } catch (err) {
    // Content script not injected yet, or tab navigated away
    console.warn('Could not reach content script:', err.message);
    return null;
  }
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/skills-src/chrome-extensions/references/extensions/message-passing.md#L1-L77). [Upstream licensing terms](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/README.md#license). Reorganized for this edition.
