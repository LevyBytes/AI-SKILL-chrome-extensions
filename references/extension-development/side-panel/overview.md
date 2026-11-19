Related section: [Communication with Side Panel](communication-side-panel.md).
# Side Panel

## Setup

Add to manifest.json:
```json
{
  "permissions": ["sidePanel"],
  "side_panel": {
    "default_path": "sidepanel/sidepanel.html"
  }
}
```

## Opening the Side Panel — REQUIRED

**A side panel definition alone does NOT make it openable.** You MUST provide an explicit
trigger to open it. Without one of these, users have no way to access the panel:

### Most common: Open on action icon click

If the extension's primary function is the side panel, remove `default_popup` from the action
and use `chrome.action.onClicked` to open the side panel:

```js
// service-worker.js
chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ windowId: tab.windowId });
});
```

⚠️ `chrome.action.onClicked` only fires when there is NO `default_popup` set. If you have both
a popup and a side panel, open the side panel from the popup via a button, or use a different
trigger.

### Alternative triggers

```js
// Open from a context menu item
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'open-panel') {
    await chrome.sidePanel.open({ windowId: tab.windowId });
  }
});

// Open from a keyboard shortcut (defined in manifest commands)
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'open-side-panel') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.sidePanel.open({ windowId: tab.windowId });
  }
});
```

You can also open it for a specific tab:
```js
await chrome.sidePanel.open({ tabId: tab.id });
```

### Simplest: Auto-open via setPanelBehavior

If the side panel should open whenever the user clicks the extension icon, use `setPanelBehavior`
as a one-liner instead of an `onClicked` listener:

```js
// service-worker.js
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
```

⚠️ **The property is `openPanelOnActionClick` — NOT `openPanelOnActionIconClick`.**
Using the wrong name causes a synchronous TypeError that silently aborts the service worker.

When using `setPanelBehavior`, do NOT also define `default_popup` — the popup takes priority.

## Setting Panel Per-Tab

```js
// Different side panel content for different tabs
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tab.url?.includes('github.com')) {
    await chrome.sidePanel.setOptions({
      tabId,
      path: 'sidepanel/github-panel.html',
      enabled: true
    });
  }
});
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/skills-src/chrome-extensions/references/extensions/side-panel.md#L1-L89). [Upstream licensing terms](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/README.md#license). Reorganized for this edition.
