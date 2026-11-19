1. The page should use the `LanguageDetector` API on `window.LanguageDetector`, and must not access the deprecated `window.ai.languageDetector` API.
1. The implementation should check API availability via `LanguageDetector.availability()`.
1. The implementation should create a detector with `LanguageDetector.create()` and call `detect()` with the input text.
1. The page should display the detected language result.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/built-in-ai/language-detection/expectations.md#L1-L4). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
