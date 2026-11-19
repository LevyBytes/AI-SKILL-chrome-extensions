```yaml
---
name: language-model
description: Run on-device natural language inference in the browser using the Prompt API, with streaming output, structured JSON responses, and multi-turn session management.
web-feature-ids:
  - languagemodel
---
```

# Language Model

The Prompt API allows developers to run natural language processing tasks directly in the browser using **Gemini Nano**. This built-in AI approach ensures user privacy, reduces server costs, and enables offline functionality.

## 1. Getting Started and Hardware Requirements

The Prompt API is currently available in Chrome as of version 148 (Desktop) for Windows, macOS, Linux, and Chromebook Plus.

### Hardware Prerequisites

- **Storage**: 22 GB free space (for the initial profile and model).
- **Memory/CPU**: 16 GB RAM and 4+ CPU cores.
- **GPU**: 4 GB VRAM or more (Required for audio input).
- **Network**: Required only for the initial model download.

### Initializing the API

**User Gesture Requirement:** When `availability()` returns `'downloadable'` or `'downloading'`, `LanguageModel.create()` starts the download and needs a user gesture, such as a button click. Call it from an event listener, not on page load, or it rejects with a `NotAllowedError`.

Check model availability before triggering a download:

```javascript
const availability = await LanguageModel.availability();

function createSession() {
	return LanguageModel.create({
		monitor(m) {
			// Inform the user while the model downloads so the UI doesn't appear frozen.
			m.addEventListener('downloadprogress', (e) => {
				console.log(`Downloaded ${e.loaded * 100}%`);
				progressEl.value = e.loaded; // a <progress max="1"> with an accessible name
			});
		},
	});
}

// Do not call create() when unavailable — the model cannot run on this device.
if (availability === 'available') {
	const session = await createSession();
} else if (availability !== 'unavailable') {
	// Starting the download requires a user gesture.
	downloadButton.addEventListener('click', async () => {
		const session = await createSession();
		downloadStatusEl.textContent = 'Model downloaded'; // a polite live region
	});
}
```

Show the download progress in a `<progress>` element with an accessible name, not only in the console, and announce when the download finishes in a polite live region (WCAG 4.1.3 Status Messages). If the button that starts the download is hidden while it has focus, move focus to the download's status text (give it `tabindex="-1"`) (WCAG 2.4.3 Focus Order).

## 2. Core Prompting Capabilities

Session examples in this section omit `session.destroy()` for brevity. Always call `session.destroy()` when a session is no longer needed to free device memory (see Section 5).


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/built-in-ai/language-model/guide.md#L1-L61). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
