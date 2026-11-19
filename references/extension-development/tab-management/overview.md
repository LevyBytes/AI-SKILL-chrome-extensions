Related section: [Events](events.md).
# Tab Management & Groups

## Permissions

```json
{
  "permissions": ["tabs", "tabGroups"]
}
```

Note: `tabs` permission gives access to `url`, `title`, `favIconUrl` on Tab objects.
Without it, you can still use `chrome.tabs` but won't see sensitive tab properties.

## Querying Tabs

```js
// All tabs
const allTabs = await chrome.tabs.query({});

// Active tab in current window
const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

// Tabs matching a URL pattern
const gmailTabs = await chrome.tabs.query({ url: '*://mail.google.com/*' });
```

## Tab Operations

```js
// Create
const tab = await chrome.tabs.create({ url: 'https://example.com', active: true });

// Update
await chrome.tabs.update(tabId, { url: 'https://new-url.com', pinned: true });

// Close
await chrome.tabs.remove(tabId);
await chrome.tabs.remove([tabId1, tabId2]); // Multiple

// Move
await chrome.tabs.move(tabId, { index: 0 }); // Move to first position

// Reload
await chrome.tabs.reload(tabId);
```

## Tab Groups

```js
// Create a group from tabs
const groupId = await chrome.tabs.group({ tabIds: [tabId1, tabId2] });

// Customize the group
await chrome.tabGroups.update(groupId, {
  title: 'Work',
  color: 'blue',     // grey, blue, red, yellow, green, pink, purple, cyan, orange
  collapsed: false
});

// Move tab into existing group
await chrome.tabs.group({ tabIds: [newTabId], groupId: existingGroupId });

// Ungroup
await chrome.tabs.ungroup(tabId);
```

## Grouping by Domain

```js
async function groupByDomain() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const byDomain = {};

  for (const tab of tabs) {
    try {
      const domain = new URL(tab.url).hostname;
      (byDomain[domain] ??= []).push(tab.id);
    } catch { /* ignore tabs without URLs */ }
  }

  for (const [domain, tabIds] of Object.entries(byDomain)) {
    if (tabIds.length > 1) {
      const groupId = await chrome.tabs.group({ tabIds });
      await chrome.tabGroups.update(groupId, {
        title: domain.replace('www.', ''),
        color: 'blue'
      });
    }
  }
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/skills-src/chrome-extensions/references/extensions/tab-management.md#L1-L92). [Upstream licensing terms](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/README.md#license). Reorganized for this edition.
