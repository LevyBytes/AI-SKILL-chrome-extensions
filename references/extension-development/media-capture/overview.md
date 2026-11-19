Related section: [State Locking — Prevent Double-Start Errors](state-locking-prevent-double-start-errors.md).
# Media Capture (Tab & Desktop)

## Choosing the Right API

| Need | API |
|------|-----|
| Record the active tab's audio/video | `chrome.tabCapture.getMediaStreamId()` |
| Let the user choose a screen, window, or tab | `chrome.desktopCapture.chooseDesktopMedia()` |

Prefer `tabCapture` when you only need the current tab — it requires no user chooser dialog and
no `"tabs"` permission. Use `desktopCapture` only when the user must select what to capture.

## Tab Capture

### Permissions

```json
{ "permissions": ["tabCapture"] }
```

### Pattern

`chrome.tabCapture.getMediaStreamId()` runs in the **service worker** and returns a stream ID.
The actual `getUserMedia()` call must happen in an **offscreen document** (the SW cannot access
media streams directly).

```js
// service-worker.js
chrome.action.onClicked.addListener(async (tab) => {
  const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id });
  // Pass the ID to the offscreen document to call getUserMedia
  await chrome.runtime.sendMessage({ type: 'START_CAPTURE', streamId });
});

// offscreen.js
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== 'START_CAPTURE') return;
  (async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { mandatory: { chromeMediaSource: 'tab', chromeMediaSourceId: msg.streamId } },
      video: { mandatory: { chromeMediaSource: 'tab', chromeMediaSourceId: msg.streamId } }
    });
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    // ... handle recorder events
  })();
});
```

## Desktop Capture

### Permissions

```json
{ "permissions": ["tabs", "desktopCapture"] }
```

`"tabs"` is **required** — `chooseDesktopMedia` needs a `targetTab` with its `url` field
populated, which requires the `"tabs"` permission.

### Pattern

```js
// service-worker.js
chrome.action.onClicked.addListener(async (tab) => {
  // ❌ BROKEN — no targetTab
  // chrome.desktopCapture.chooseDesktopMedia(['screen', 'window'], cb);

  // ✅ CORRECT — pass the active tab
  chrome.desktopCapture.chooseDesktopMedia(['screen', 'window', 'tab'], tab, (streamId) => {
    if (!streamId) return; // User cancelled
    // Send streamId to offscreen document for getUserMedia
    chrome.runtime.sendMessage({ type: 'START_DESKTOP_CAPTURE', streamId });
  });
});
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/skills-src/chrome-extensions/references/extensions/media-capture.md#L1-L76). [Upstream licensing terms](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/README.md#license). Reorganized for this edition.
