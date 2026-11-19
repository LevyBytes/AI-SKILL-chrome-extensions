Related section: [DOM Manipulation Best Practices](dom-manipulation-best-practices.md).
# Content Scripts & DOM Manipulation

## Two Ways to Inject

### 1. Static (manifest declaration)
```json
{
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content/content.js"],
    "css": ["content/content.css"],
    "run_at": "document_idle"
  }]
}
```

### 2. Programmatic (from service worker or popup)
```js
// Requires "scripting" permission and host access
chrome.scripting.executeScript({
  target: { tabId: tabId },
  files: ['content/content.js']
});

// Or inject a function directly
chrome.scripting.executeScript({
  target: { tabId: tabId },
  func: (param) => {
    document.body.style.backgroundColor = param;
  },
  args: ['yellow']
});
```

Use `activeTab` permission for on-click injection (no host_permissions needed):
```json
{
  "permissions": ["activeTab", "scripting"]
}
```

## Isolated World

Content scripts run in an isolated world:
- They share the DOM with the page but NOT JavaScript variables
- They can access chrome.runtime messaging APIs
- The page's CSP does NOT restrict content script code
- `window` refers to the content script's isolated world

## Message Passing from Content Scripts

```js
// content.js → service worker
chrome.runtime.sendMessage({ type: 'DATA', payload: data }, (response) => {
  console.log('Got response:', response);
});

// service worker → content script in a specific tab
chrome.tabs.sendMessage(tabId, { type: 'UPDATE', data: newData });

// content.js: listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_CONTENT') {
    const text = document.body.innerText;
    sendResponse({ text });
  }
  return true; // Keep channel open for async sendResponse
});
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/skills-src/chrome-extensions/references/extensions/content-scripts.md#L1-L70). [Upstream licensing terms](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/README.md#license). Reorganized for this edition.
