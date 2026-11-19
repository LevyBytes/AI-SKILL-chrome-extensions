Related section: [Summarizer](overview.md).
## Summarization Methods

### 1. Batch Summarization

Processes the entire text at once and returns the result.

```javascript
const longText = document.querySelector('article').innerText;
const summary = await summarizer.summarize(longText, {
  context: 'This article is intended for a tech-savvy audience.',
});
console.log(summary);
```

### 2. Stream Summarization

Returns results in real-time as the model generates them, providing a more
responsive UI.

```javascript
const stream = summarizer.summarizeStreaming(longText);
for await (const chunk of stream) {
  console.log(chunk);
}
```

## Security and Permissions

- **Data Privacy**: No data is sent to Google; processing happens on the local
  device.
- **Cross-Origin**: Access can be granted to iframes using the Permission
  Policy.

  ```html
  <iframe src="https://example.com/" allow="summarizer"></iframe>
  ```

- **Web Workers**: Currently not supported.

## Fallback Strategy

Browser support for Summarizer: Limited availability.
Supported by: Chrome 138 (Jun 2025) and Edge 138 (Jun 2025).
Unsupported in: Firefox and Safari.

Before initializing or querying availability, check if the browser supports the `Summarizer` API:

```javascript
if ('Summarizer' in self) {
  // The Summarizer API is supported.
} else {
  // Execute fallback strategy
}
```

If the `Summarizer` API is unsupported or availability checks return `'unavailable'`, you must gracefully fall back.

Recommended options:

1. **Remote API Fallback**: Direct the distillation request to a server endpoint or remote API (such as the Vertex AI Gemini API) so that users still get summaries.
2. **Graceful Degradation**: Visually disable the summarization controls in the UI, or hide the button while displaying a friendly message (e.g., `"Local summarization is currently unsupported in this browser"`). Do not allow interaction to trigger generic unhandled runtime exceptions.
3. **Polyfill Fallback**: You can use community-maintained polyfills like `built-in-ai-task-apis-polyfills` or `prompt-api-polyfill` to emulate the API surface using remote services with models in the cloud or on-device inference with local models.

> **Privacy and Cost Implications:** These polyfills possibly proxy requests to remote servers (such as Gemini API over the cloud). This completely nullifies the on-device privacy guarantees of the native Built-in AI APIs and will incur server-side API usage costs.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/built-in-ai/summarizer.md#L97-L160). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
