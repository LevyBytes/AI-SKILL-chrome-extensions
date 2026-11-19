## Fallback Strategy

Browser support for Translator: Limited availability.
Supported by: Chrome 138 (Jun 2025) and Edge 148 (May 2026).
Unsupported in: Firefox and Safari.

Before use, check if the `Translator` object is available in the global scope:

```javascript
if ('Translator' in self) {
  // The Translator API is supported.
} else {
  // Execute fallback strategy (do not fall back to window.ai.translator).
}
```

If the `Translator` API is unsupported or availability checks return `'unavailable'`, you must gracefully fall back.

Recommended options:

1. **Remote API Fallback**: Redirect the translation request to a server endpoint or cloud remote API (such as the Vertex AI Gemini API) to deliver translation functionality.
2. **Graceful Degradation**: Visually disable translation control elements or buttons while showing an end-user friendly note (e.g., `"Client-side translation is currently unsupported in this browser"`). Do not allow unhandled exceptions.
3. **Polyfill Fallback**: You can use community-maintained polyfills like `built-in-ai-task-apis-polyfills` or `prompt-api-polyfill` to emulate the API surface using remote services.

> **Privacy and Cost Implications:** These polyfills possibly proxy requests to remote servers (such as Gemini API over the cloud), though local processing is an option, too. Remote processing completely nullifies the on-device privacy guarantees of the native Built-in AI APIs and will often incur server-side API usage costs.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/built-in-ai/translator.md#L172-L196). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
