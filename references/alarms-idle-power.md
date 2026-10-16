# Alarms, Idle and Power

## [chrome.alarms](https://developer.chrome.com/docs/extensions/reference/api/alarms)
- **Purpose:** run code at a future moment or on a repeating schedule — the MV3-friendly replacement for `setTimeout`/`setInterval` in a service worker.
- **Permission:** `"alarms"`.
- **Key methods** (Promises): `create(name?, alarmInfo)`; `get(name?)` → resolves to an `Alarm` or `undefined`; `getAll()` → resolves to `Alarm[]`; `clear(name?)` → resolves to a `boolean`; `clearAll()` → resolves to a `boolean`.
- **Key events:** `onAlarm` → `(alarm)`.
- **Key types:** `Alarm` = `{name, scheduledTime (ms past epoch), periodInMinutes?, persistAcrossSessions (Chrome 150+)}`; `AlarmCreateInfo` = `{when? (ms past epoch), delayInMinutes?, periodInMinutes?, persistAcrossSessions? (Chrome 150+)}`.
- **MV3 notes:** Chrome 120+ allows a minimum 30-second period in packed extensions; older versions use a one-minute floor; values for `delayInMinutes`/`periodInMinutes` under `0.5` minutes log a warning and are clamped. Unpacked extensions bypass the floor. Alarms do not wake a sleeping device — a missed alarm fires once on wake.

```js
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "refresh") console.log("fired at", alarm.scheduledTime);
});
async function ensureRefreshAlarm() {
  if (!(await chrome.alarms.get("refresh"))) {
    await chrome.alarms.create("refresh", { delayInMinutes: 1, periodInMinutes: 5 });
  }
}
// Check on every worker start; older Chrome may clear alarms on browser restart.
ensureRefreshAlarm().catch(console.error);
```

## [chrome.idle](https://developer.chrome.com/docs/extensions/reference/api/idle)
- **Purpose:** detect when the machine transitions between active use, idleness, and a locked screen.
- **Permission:** `"idle"`.
- **Key methods:** `queryState(detectionIntervalInSeconds)` → resolves to an `IdleState`; `setDetectionInterval(intervalInSeconds)` (default `60` seconds); `getAutoLockDelay()` → resolves to a number (ChromeOS only, Chrome 73+).
- **Key events:** `onStateChanged` → `(newState)`.
- **Key types:** `IdleState` = `"active"`, `"idle"`, `"locked"`.
- **MV3 notes:** `"locked"` is only reported where the OS exposes lock/screensaver state. Registering `onStateChanged` from the service worker lets idle transitions wake it.

```js
chrome.idle.setDetectionInterval(30);
chrome.idle.onStateChanged.addListener((newState) => console.log("idle ->", newState));
const state = await chrome.idle.queryState(15);
```

## [chrome.power](https://developer.chrome.com/docs/extensions/reference/api/power)
- **Purpose:** temporarily override the OS power-management policy to keep the system (or display) awake.
- **Permission:** `"power"`.
- **Key methods:** `requestKeepAwake(level)` (a new call replaces this extension's prior request); `releaseKeepAwake()`; `reportActivity()` (Chrome 113+, ChromeOS only) → resolves when reported.
- **Key types:** `Level` = `"system"` (block sleep on inactivity; display may still turn off) or `"display"` (keep the display on and the system awake). `"display"` takes precedence over `"system"`.
- **MV3 notes:** `requestKeepAwake`/`releaseKeepAwake` are fire-and-forget. Always pair a request with a release; another extension's higher-precedence level can override yours.

```js
chrome.power.requestKeepAwake("display"); // keep screen on during a long task
chrome.power.releaseKeepAwake();
```

For runtime messages and listeners, read [Runtime messaging and events](runtime-messaging-events.md).
