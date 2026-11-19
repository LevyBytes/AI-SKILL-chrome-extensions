- The `Translator` API should be available in the browser on `window.Translator`, but not on `window.ai.translator`.
- The `Translator.availability()` function must be called with both `sourceLanguage` and `targetLanguage` options.
- The `Translator.availability()` function should return `available` or `downloadable` or `downloading` or `unavailable`.
- The same `sourceLanguage` and `targetLanguage` options should be passed to both `Translator.availability()` and `Translator.create()`.
- The `Translator` instance's `translate()` or `translateStreaming()` method should be used to generate a translation.
- A monitor for download progress should be implemented using the `downloadprogress` event.
- The translated text must be wrapped inside an element that contains the `lang` attribute, and the value of this attribute must match the correct BCP 47 language code for the translated text.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/built-in-ai/translator/expectations.md#L1-L7). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
