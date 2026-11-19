## Registering Scripts (Persistent)

`register()` / `update()` / `getScripts()` / `unregister()` manage scripts that persist across
page loads and browser sessions. Registered scripts survive the service worker being terminated.

```js
// ❌ BROKEN — both code and file specified (ScriptSource must have exactly one)
await chrome.userScripts.register([{
  id: 'my-script',
  matches: ['https://example.com/*'],
  js: [{ code: 'alert(1)', file: 'user-script.js' }] // Error: specify code OR file, not both
}]);

// ❌ BROKEN — id starts with underscore (reserved prefix)
await chrome.userScripts.register([{ id: '_my-script', ... }]);
// Error: User script IDs must not start with '_'

// ✅ CORRECT — register from a file bundled with the extension
await chrome.userScripts.register([{
  id: 'my-user-script',
  matches: ['https://example.com/*'],
  js: [{ file: 'user-script.js' }],
  runAt: 'document_idle'  // optional, this is the default
}]);

// ✅ CORRECT — register inline code supplied by the user
await chrome.userScripts.register([{
  id: 'my-user-script',
  matches: ['https://example.com/*'],
  js: [{ code: userProvidedCode }]
}]);
```

Always check before calling `register()` vs `update()` — registering an already-existing ID
throws an error:

```js
const existing = await chrome.userScripts.getScripts({ ids: ['my-user-script'] });
if (existing.length > 0) {
  await chrome.userScripts.update([{ id: 'my-user-script', js: [{ code: updatedCode }] }]);
} else {
  await chrome.userScripts.register([{
    id: 'my-user-script',
    matches: ['https://example.com/*'],
    js: [{ code: userProvidedCode }]
  }]);
}

// Remove a specific script
await chrome.userScripts.unregister({ ids: ['my-user-script'] });

// Remove all registered user scripts
await chrome.userScripts.unregister();
```

## Persistence: Restore on Extension Update

**Registered user scripts are cleared when the extension updates.**

```js
// ❌ BROKEN — scripts registered once at install time are lost on every update
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    chrome.userScripts.register([{ id: 'foo', matches: [...], js: [...] }]);
    // After the next extension update, 'foo' is gone — no re-registration
  }
});

// ✅ CORRECT — persist configs in storage, restore on both install and update
chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === chrome.runtime.OnInstalledReason.UPDATE) {
    const { scripts = {} } = await chrome.storage.local.get('scripts');
    for (const s of Object.values(scripts)) {
      await chrome.userScripts.register([s]).catch(() => {});
    }
  }
});
```

Save the full script config (id, matches, js) to `chrome.storage` whenever the user saves
a script, so it can be restored after an update.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/skills-src/chrome-extensions/references/extensions/user-scripts.md#L72-L153). [Upstream licensing terms](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/README.md#license). Reorganized for this edition.
