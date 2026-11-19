Related section: [Service worker](overview.md).
## Pattern: Event Registration

All event listeners MUST be registered synchronously at the top level of the service worker.
Chrome replays events to a restarted SW, but only for listeners that were registered synchronously.

```js
// ✅ GOOD: Top-level registration
chrome.runtime.onMessage.addListener(handleMessage);
chrome.tabs.onUpdated.addListener(handleTabUpdate);
chrome.webNavigation.onCompleted.addListener(handleNavigation);

// ❌ BAD: Conditional or async registration
async function setup() {
  const { enabled } = await chrome.storage.local.get('enabled');
  if (enabled) {
    chrome.tabs.onUpdated.addListener(handleTabUpdate); // Too late!
  }
}
setup();
```

Instead, register all listeners and check conditions inside them:

```js
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const { enabled } = await chrome.storage.local.get('enabled');
  if (!enabled) return;
  // Process...
});
```

## Date-Based Resets

For daily counters, store the date alongside the count:

```js
function getToday() {
  return new Date().toISOString().split('T')[0]; // "2025-01-15"
}

async function incrementDailyCount() {
  const { dailyCount = 0, countDate = '' } = await chrome.storage.local.get(['dailyCount', 'countDate']);
  const today = getToday();

  if (countDate !== today) {
    // New day — reset
    await chrome.storage.local.set({ dailyCount: 1, countDate: today });
    return 1;
  } else {
    const newCount = dailyCount + 1;
    await chrome.storage.local.set({ dailyCount: newCount });
    return newCount;
  }
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/skills-src/chrome-extensions/references/extensions/service-worker.md#L94-L148). [Upstream licensing terms](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/README.md#license). Reorganized for this edition.
