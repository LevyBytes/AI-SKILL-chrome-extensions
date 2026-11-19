Related section: [chrome.permissions.request() needs a user gesture — the gesture survives one sendMessage hop, but not an await after tha](chrome-permissions-request-needs-user-gesture.md).
# Permissions

## `permissions` vs `host_permissions`

These are separate manifest keys — don't conflate them:

```json
{
  "permissions": ["tabs", "scripting", "storage"],
  "host_permissions": ["https://api.example.com/*"]
}
```

- `permissions` grants access to chrome.* APIs (`tabs`, `storage`, `scripting`, `desktopCapture`, etc.)
- `host_permissions` grants access to specific origins for `fetch`, `chrome.scripting.executeScript`, and reading tab URLs cross-origin

Scope `host_permissions` to specific domains rather than `<all_urls>` unless the extension genuinely needs to run on every site — broad host permissions draw extra Chrome Web Store review scrutiny.

## `tab.url` requires the `tabs` permission

Without it, `tab.url` and `tab.title` silently return `undefined` — no error thrown.

```js
// manifest.json — REQUIRED if you read tab.url or tab.title anywhere:
{ "permissions": ["tabs"] }
```

See `references/extensions/tab-management.md` for the full tabs/windows API.

## `activeTab` only works on direct user gestures — not from side panels

`activeTab` grants temporary access to the current tab ONLY when triggered by:
- Clicking the extension action icon
- A context menu item (including the `"tab"` context)
- A keyboard shortcut from the `commands` API
- Accepting an omnibox suggestion

It does **NOT** grant access when clicking a button in a side panel, a popup button that opens
later, or any programmatic trigger.

```js
// ❌ BROKEN — activeTab does NOT work from a side panel button click
document.getElementById('summarize').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: () => document.body.innerText });
});

// ✅ FIX — use "tabs" permission + specific host_permissions instead
// manifest.json: { "permissions": ["tabs", "scripting"], "host_permissions": ["<all_urls>"] }
```

See `references/extensions/side-panel.md` for the side-panel-specific writeup.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/skills-src/chrome-extensions/references/extensions/permissions.md#L1-L53). [Upstream licensing terms](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/README.md#license). Reorganized for this edition.
