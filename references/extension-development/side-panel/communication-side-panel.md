Related section: [Side panel](overview.md).
## Communication with Side Panel

The side panel is an extension page, so it can use all chrome.* APIs directly and communicate
with the service worker via `chrome.runtime.sendMessage` / `chrome.runtime.onMessage`.

To get data from the active tab's content script:

```js
// In side panel JS
async function getPageContent() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_CONTENT' });
  return response;
}
```

Or use `chrome.scripting.executeScript` from the side panel (requires `scripting` and `activeTab` permissions):

```js
const [{ result }] = await chrome.scripting.executeScript({
  target: { tabId: tab.id },
  func: () => document.body.innerText
});
```

## Side Panel vs Popup

| Feature | Side Panel | Popup |
|---------|-----------|-------|
| Stays open | Yes | Closes when clicking away |
| Resizable | Yes (by user) | Fixed size |
| Coexists with page | Yes (side by side) | Overlays page |
| Use when | Extended interaction, reading | Quick actions, settings |

## Important Notes

- The side panel shares a single instance per window — opening it replaces existing content
- Use `chrome.sidePanel.setOptions({ enabled: false })` to disable for specific tabs
- Side panel HTML files have full access to chrome.* APIs
- The side panel persists across tab switches (per-window)

### ⚠️ `activeTab` does NOT work from side panel interactions

`activeTab` only grants tab access on direct user gestures: clicking the extension icon, context
menu items, keyboard shortcuts, or omnibox suggestions. **Clicking a button inside a side panel
does NOT activate `activeTab`.**

If your side panel needs to read or modify page content (e.g., a "Summarize" button), use
`tabs` + `host_permissions` instead:

```json
{
  "permissions": ["tabs", "scripting", "sidePanel"],
  "host_permissions": ["<all_urls>"]
}
```

Do NOT rely on `activeTab` for side panel functionality.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/skills-src/chrome-extensions/references/extensions/side-panel.md#L90-L147). [Upstream licensing terms](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/README.md#license). Reorganized for this edition.
