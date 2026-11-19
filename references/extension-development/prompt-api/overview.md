Related section: [sidepanel/sidepanel.js](sidepanel-sidepanel-js.md).
# Chrome Prompt API (LanguageModel) — Extension-Specific Notes

The `LanguageModel` API (Prompt API) works in all extension contexts — service worker, popup,
side panel, and other extension pages — with no additional manifest permissions required.

For general Prompt API usage (availability checks, session creation, streaming, session
management), use the `modern-web-guidance` skill.

## Deprecated namespace

Extensions that used the origin trial may still have the old API surface. Remove it:

```js
// ❌ OLD — deprecated
const session = await self.ai.languageModel.create();

// ✅ CURRENT (Chrome 138+)
const session = await LanguageModel.create({ ... });
```

Also remove the expired permission from manifest.json:
```json
"permissions": ["aiLanguageModelOriginTrial"]  // ❌ remove this
```

## Extension-only: `LanguageModel.params()`

Extensions have access to `LanguageModel.params()`, which returns model constraints not
available on the web:

```js
const params = await LanguageModel.params();
// { defaultTopK: 3, maxTopK: 128, defaultTemperature: 1, maxTemperature: 2 }

const session = await LanguageModel.create({
  temperature: 0.7,
  topK: 5
});
```

## Complete extension example: page summarizer

A full wiring example showing manifest + service worker + side panel together.
Note the use of `tabs` + `host_permissions` instead of `activeTab` — side panel button
clicks do NOT activate `activeTab` (see Rule 12).

### manifest.json
```json
{
  "manifest_version": 3,
  "name": "AI Page Summarizer",
  "version": "1.0",
  "permissions": ["sidePanel", "tabs", "scripting"],
  "host_permissions": ["<all_urls>"],
  "background": { "service_worker": "service-worker.js" },
  "side_panel": { "default_path": "sidepanel/sidepanel.html" },
  "action": { "default_title": "Summarize Page" }
}
```

### service-worker.js
```js
chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ windowId: tab.windowId });
});
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/skills-src/chrome-extensions/references/extensions/prompt-api.md#L1-L67). [Upstream licensing terms](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/README.md#license). Reorganized for this edition.
