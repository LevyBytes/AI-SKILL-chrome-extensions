## Complete Script Manager Pattern

```js
// options.js — save user's script and (re)register it
async function saveScript(id, matches, code) {
  // Persist the config so we can restore it after extension updates
  const { scripts = {} } = await chrome.storage.local.get('scripts');
  scripts[id] = { id, matches, js: [{ code }] };
  await chrome.storage.local.set({ scripts });

  // Register or update the live script
  const existing = await chrome.userScripts.getScripts({ ids: [id] });
  if (existing.length > 0) {
    await chrome.userScripts.update([{ id, matches, js: [{ code }] }]);
  } else {
    await chrome.userScripts.register([{ id, matches, js: [{ code }] }]);
  }
}
```

## Key Differences from Content Scripts

| | Content Scripts | userScripts |
|--|-----------------|-------------|
| Code source | Bundled with extension | Provided by user at runtime |
| Persistence | Automatic (manifest) | Manual (register + restore on update) |
| Arbitrary code | No | Yes |
| User opt-in | No | Yes (Developer Mode / Allow User Scripts) |
| Messaging | `runtime.sendMessage` | `runtime.onUserScriptMessage` (after `configureWorld`) |
| CSP exemption | Yes | Yes (USER_SCRIPT world) |
| Multiple worlds | No | Yes (Chrome 133+ with `worldId`) |

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/skills-src/chrome-extensions/references/extensions/user-scripts.md#L243-L273). [Upstream licensing terms](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/README.md#license). Reorganized for this edition.
