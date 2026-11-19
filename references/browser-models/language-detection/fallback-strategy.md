Related section: [Language detection](overview.md).
## Fallback Strategy

{{ BASELINE_STATUS("languagedetector") }}

Before use, check if the `LanguageDetector` object is available in the global scope:

```javascript
if ('LanguageDetector' in self) {
  // The Language Detector API is supported.
} else {
  // Execute fallback strategy
}
```

If the `LanguageDetector` API is unsupported or availability checks return `'unavailable'`, you must gracefully fall back:

1. **Remote API Fallback**: Redirect the detection request to a server endpoint or a cloud API (such as the Vertex AI Gemini API) to identify the language.
2. **Graceful Degradation**: Disable language detection elements/buttons and inform the user that client-side detection is currently unsupported in this browser, preventing any unhandled exceptions or crashes.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/built-in-ai/language-detection/guide.md#L83-L100). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
