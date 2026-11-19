# Translator

The **Translator API** allows developers to perform client-side text translation using built-in AI models in Chrome and Edge. This approach eliminates the need for cloud-based translation services for ephemeral content, reducing costs and improving privacy by keeping data on the user's device.

## Prerequisites & Requirements

### API Surface & Global Scope

- **MANDATORY:** Access the Translator API exclusively via the global `Translator` interface (`window.Translator` / `self.Translator`).
- **DO NOT** use or check the deprecated `window.ai.translator` namespace.

### Browser Support

- **Chrome:** Version 138+ (Desktop only).
- **Edge:** Version 148+ (Desktop only).
- **Not Supported:** Mobile (Android/iOS), Firefox, Safari.

### Hardware Requirements

To run Gemini Nano and associated models, the system needs:

- **Operating System:** Windows 10/11, macOS 13+, Linux, or ChromeOS (Chromebook
  Plus).
- **Storage:** At least **22 GB** free on the profile volume.
- **Memory/CPU:** 16 GB+ RAM and 4+ CPU cores.
- **GPU:** 4 GB+ VRAM (Mandatory for Prompt API with audio).
- **Network:** Required only for the initial download of language packs/models.

## Implementation & Code Samples

### 1. Checking Availability & Model Management

**Mandatory Options Passing:** You must pass the identical configuration options object containing `sourceLanguage` and `targetLanguage` to both `Translator.availability(options)` and `Translator.create(options)`.

**Recommended Progress Monitoring:** You should implement a monitor for model download progress by providing a `monitor(m)` callback to `Translator.create()` and adding a listener for the `downloadprogress` event, so the user can see model download progress.

**User Gesture Requirement:** When calling `availability(options)` returns `'downloadable'` or `'downloading'`, calling `Translator.create()` triggers the download of the language pack and **strictly requires a user gesture** (such as a button click) to prevent a `NotAllowedError`.

`Translator.availability(options)` returns one of four string statuses:

- `'available'`: The language pair model is already downloaded on the device and ready for immediate translation.
- `'downloadable'`: The language pair is supported, but the model needs to be downloaded. A user gesture is required to initiate `Translator.create()`.
- `'downloading'`: The language pack is currently in the process of downloading. Calling `Translator.create()` with a user gesture attaches to the download.
- `'unavailable'`: The language pair or device is not supported. Execute your fallback strategy.

```javascript
// Language pair options passed to both availability() and create()
const options = {
  sourceLanguage: 'es', // Example BCP 47 language code
  targetLanguage: 'fr', // Example BCP 47 language code
};

// 1. Check availability for the language pair
const availability = await Translator.availability(options);

if (availability === 'available') {
  // Model is ready immediately on device
  const translator = await Translator.create(options);
} else if (availability === 'downloadable' || availability === 'downloading') {
  // User gesture is strictly required before create() triggers or attaches to download
  document.getElementById('start-translation-btn').addEventListener('click', async () => {
    const translator = await Translator.create({
      ...options,
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          console.log(`Downloaded ${Math.round(e.loaded * 100)}%`);
        });
      },
    });
  });
} else if (availability === 'unavailable') {
  // Language pair or hardware unsupported; execute fallback
  console.warn('Translation model is unavailable on this device.');
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/built-in-ai/translator.md#L1-L76). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
