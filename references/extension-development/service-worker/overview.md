Related section: [Pattern: Event Registration](pattern-event-registration.md).
# Service Worker Lifetime & State Management

## The Core Problem

Chrome terminates extension service workers after ~30 seconds of inactivity. Unlike Manifest V2
persistent background pages, you CANNOT rely on in-memory state.

## Rules

1. **Never store state in global variables** — treat every event handler as if the SW just started
2. **Use chrome.storage for all persistent state** — read on demand, write after changes
3. **Use chrome.alarms for timers** — not setTimeout/setInterval (these die with the SW)
4. **Use chrome.storage.session for ephemeral session state** — survives SW restart but not browser restart

## Storage Tier Selection

| Need | Use |
|------|-----|
| Survives browser restart, syncs across devices | `chrome.storage.sync` (8KB/item, 100KB total) |
| Survives browser restart, local only | `chrome.storage.local` (10MB default) |
| Survives SW restart only | `chrome.storage.session` (10MB default) |
| Never persisted (avoid) | Global variables ❌ |

## Pattern: State Read-on-Demand

```js
// ❌ BAD: State in memory
let count = 0;
chrome.webNavigation.onCompleted.addListener(() => {
  count++;
  chrome.action.setBadgeText({ text: String(count) });
});

// ✅ GOOD: State in storage
chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId !== 0) return; // Main frame only
  const data = await chrome.storage.local.get({ visitCount: 0 });
  data.visitCount++;
  await chrome.storage.local.set(data);
  chrome.action.setBadgeText({ text: String(data.visitCount) });
});
```

## Pattern: Alarms Instead of Timers

```js
// ❌ BAD: Timer dies when SW terminates
setInterval(() => checkForUpdates(), 60000);

// ✅ GOOD: Alarm persists
chrome.alarms.create('check-updates', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'check-updates') {
    checkForUpdates();
  }
});
```

Minimum alarm interval: 0.5 minutes.

## Pattern: One-Time Initialization

```js
// Set up defaults and context menus on install
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await chrome.storage.local.set({ settings: defaultSettings });
  }
  // Context menus must be re-created (they persist, but re-creating is idempotent)
  chrome.contextMenus.create({
    id: 'myItem',
    title: 'My Context Menu Item',
    contexts: ['selection']
  });
});
```

## Pattern: Keeping the SW Alive (When Necessary)

Occasionally you need the SW alive for a long-running operation. Use one of:

1. **chrome.offscreen** — create an offscreen document for long tasks
2. **Periodic storage writes** — each chrome.storage call resets the idle timer
3. **Active port connections** — an open port keeps the SW alive

```js
// Port-based keepalive from popup/side panel
const port = chrome.runtime.connect({ name: 'keepalive' });
// The SW stays alive as long as this port is open
```

⚠️ Do NOT abuse keepalive patterns. Chrome may enforce stricter limits in future versions.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/skills-src/chrome-extensions/references/extensions/service-worker.md#L1-L93). [Upstream licensing terms](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/README.md#license). Reorganized for this edition.
