Related section: [Message passing](overview.md).
## Long-lived connections (ports)

Use ports when you need a persistent channel (e.g., streaming data, DevTools panel):

```js
// opener (popup or content script)
const port = chrome.runtime.connect({ name: 'my-channel' });
port.postMessage({ type: 'START' });
port.onMessage.addListener((msg) => console.log('received:', msg));
port.onDisconnect.addListener(() => console.log('disconnected'));

// receiver (service worker)
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'my-channel') return;
  port.onMessage.addListener((msg) => {
    if (msg.type === 'START') {
      port.postMessage({ status: 'ok' });
    }
  });
});
```

## Common mistakes

### Missing `return true` causes response to never arrive

```js
// ❌ BROKEN — async work completes but channel is already closed
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  fetchSomething().then(data => sendResponse(data)); // too late
  // missing: return true
});

// ✅ CORRECT
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  fetchSomething().then(data => sendResponse(data));
  return true;
});
```

### Sending to a tab before the content script is ready

Content scripts are injected after the page loads. If the service worker sends a message immediately on `tabs.onUpdated`, the content script may not be listening yet. Use a handshake or retry:

```js
// content script — announce it's ready
chrome.runtime.sendMessage({ type: 'CONTENT_READY' });

// service worker — wait for CONTENT_READY before sending
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === 'CONTENT_READY' && sender.tab) {
    chrome.tabs.sendMessage(sender.tab.id, { type: 'INIT_DATA', ... });
  }
});
```

### Multiple listeners responding

Only one listener should respond to a given message type. If multiple listeners call `sendResponse`, only the first one wins and the rest are silently ignored.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/skills-src/chrome-extensions/references/extensions/message-passing.md#L78-L136). [Upstream licensing terms](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/README.md#license). Reorganized for this edition.
