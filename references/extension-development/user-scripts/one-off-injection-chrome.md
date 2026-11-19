## One-Off Injection (Chrome 135+)

`execute()` injects a script immediately into a specific tab/frame without registering it. It
does not persist across page loads.

```js
// Requires Chrome 135+
const results = await chrome.userScripts.execute({
  target: { tabId: tabId },
  js: [{ code: userProvidedCode }],
  world: 'USER_SCRIPT'  // optional, default
});

for (const result of results) {
  if (result.error) {
    console.error('Injection failed in frame', result.frameId, result.error);
  } else {
    console.log('Result from frame', result.frameId, result.result);
  }
}
```

Guard for Chrome 135+ availability:

```js
if (typeof chrome.userScripts.execute === 'function') {
  await chrome.userScripts.execute({ ... });
} else {
  // Fall back to register-based approach
}
```

## Messaging from User Scripts

User scripts run in the `USER_SCRIPT` world which has no access to `chrome.runtime` by
default. Messaging requires an explicit opt-in.

```js
// ❌ BROKEN — messaging not enabled; chrome.runtime is undefined in the user script
// sw.js
chrome.runtime.onMessage.addListener((msg) => { ... }); // Never fires from user scripts

// user script code (running in the page)
chrome.runtime.sendMessage({ type: 'hello' }); // TypeError: chrome is not defined

// ✅ CORRECT — opt in first, then use the dedicated listener
// sw.js (run once, e.g. on install)
await chrome.userScripts.configureWorld({ messaging: true });

// sw.js — listen on the dedicated handler, not onMessage
chrome.runtime.onUserScriptMessage.addListener((message, sender, sendResponse) => {
  sendResponse({ ok: true });
  return true; // keep channel open for async responses
});

// user script code — chrome.runtime is now available
chrome.runtime.sendMessage({ type: 'FROM_USER_SCRIPT', data: 42 });
```

For long-lived connections use `chrome.runtime.onUserScriptConnect` (analogous to
`runtime.onConnect` for content scripts).

Chrome 133+ supports per-world messaging with `worldId`:

```js
await chrome.userScripts.configureWorld({ worldId: 'my-world', messaging: true });
```

## `configureWorld()` — CSP and Messaging

```js
await chrome.userScripts.configureWorld({
  csp: "script-src 'self'",  // custom CSP for the world
  messaging: true             // enable chrome.runtime messaging
});

// Chrome 133+: configure a named world
await chrome.userScripts.configureWorld({
  worldId: 'my-world',
  messaging: true
});

// Chrome 133+: reset a world's configuration
await chrome.userScripts.resetWorldConfiguration('my-world');

// Chrome 133+: list all world configurations
const configs = await chrome.userScripts.getWorldConfigurations();
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/skills-src/chrome-extensions/references/extensions/user-scripts.md#L154-L242). [Upstream licensing terms](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/README.md#license). Reorganized for this edition.
