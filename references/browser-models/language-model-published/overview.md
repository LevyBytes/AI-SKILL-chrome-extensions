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

### Basic and Streamed Output

For short responses, use `prompt()`. For longer content, use `promptStreaming()` to provide a more responsive UI.

**MANDATORY**: Never assign model output to `innerHTML`. Model output is untrusted and can contain injected markup. Always use `textContent` or a sanitizer.

```javascript
const session = await LanguageModel.create();

// prompt() accumulates the full response before resolving — use for short, one-shot output.
const result = await session.prompt('Write a haiku about coding.');
// textContent, not innerHTML — model output is untrusted and must not be parsed as markup.
outputEl.textContent = result;

// promptStreaming() yields independent chunks that must be concatenated;
// use for longer content so each chunk can be rendered progressively.
const stream = session.promptStreaming('Write a long story about a robot.');
let completeResult = '';
outputEl.setAttribute('aria-busy', 'true'); // outputEl: <div aria-live="polite">
try {
	for await (const chunk of stream) {
		completeResult += chunk;
		outputEl.append(chunk);
	}
} finally {
	outputEl.setAttribute('aria-busy', 'false');
}
console.log('Full story:', completeResult);
```

Make the element that receives the output a polite live region that is in the page from page load, and set `aria-busy="true"` on it while a response streams in, so assistive technologies announce the complete response rather than each chunk (WCAG 4.1.3 Status Messages). Don't move focus while it streams in.

**MANDATORY:** If the output language differs from the page language, set `lang` on the output element to the language declared in `expectedOutputs`, so screen readers pronounce it correctly (WCAG 3.1.2 Language of Parts).


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/built-in-ai/language-model.md#L1-L88). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. [Alternate upstream path](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/built-in-ai/prompt-api.md). Reorganized for this edition.
