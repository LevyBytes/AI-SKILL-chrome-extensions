# Offscreen Document Lifecycle

Open when creating, sharing or closing an offscreen document without duplicate-creation races.

## [chrome.offscreen](https://developer.chrome.com/docs/extensions/reference/api/offscreen)
- **Purpose:** create a hidden document so a service worker can use DOM-dependent web APIs (clipboard, parsing, audio, WebRTC) that the worker lacks.
- **Permission:** `"offscreen"`.
- **Key methods** (Promises): `createDocument(parameters)` → resolves after the document's initial load; `closeDocument()`; `hasDocument()` → resolves to a `boolean`.
- **Key types:** `CreateParameters` = `{url (relative static HTML bundled with the extension), reasons, justification}`. `Reason` = `TESTING`, `AUDIO_PLAYBACK`, `IFRAME_SCRIPTING`, `DOM_SCRAPING`, `BLOBS`, `DOM_PARSER`, `USER_MEDIA`, `DISPLAY_MEDIA`, `WEB_RTC`, `CLIPBOARD`, `LOCAL_STORAGE`, `WORKERS`, `BATTERY_STATUS`, `MATCH_MEDIA`, `GEOLOCATION`.
- **MV3 notes:** available Chrome 109+. One offscreen document per profile may be open; split incognito has its own instance. hasDocument() requires Chrome 150+; the example uses runtime.getContexts() on Chrome 116+ and serializes creation. An `AUDIO_PLAYBACK` document is auto-closed after 30 seconds with no audio playing. Inside the offscreen page, `chrome.runtime` is the only extensions API available, so route work via messaging.

```js
let creatingOffscreen;
function ensureOffscreen() {
  if (creatingOffscreen) return creatingOffscreen;
  creatingOffscreen = (async () => {
    const contexts = await chrome.runtime.getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"],
      documentUrls: [chrome.runtime.getURL("offscreen.html")],
    });
    if (contexts.length) return;
    await chrome.offscreen.createDocument({
      url: "offscreen.html", reasons: ["CLIPBOARD"],
      justification: "Write to the clipboard from the service worker",
    });
  })().finally(() => { creatingOffscreen = undefined; });
  return creatingOffscreen;
}
```

[Topic context](api-runtime-misc.md)
