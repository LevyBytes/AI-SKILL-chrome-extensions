#### Empower user control and overrides

*Applies to: All APIs.*

**Do:** Make the user the final editor of all generated content. Provide intuitive overrides so the user maintains full ownership for the final output. The APIs may produce incorrect results.

**Don't:** Force an AI-generated result as the only option.

#### Cache results for repeated tasks

*Applies to: All APIs.*

**Do:** Implement a local result cache (for example, using `sessionStorage` or
`IndexedDB`) for repeated inputs or queries. Normalize the input by trimming
whitespace and lowercasing to increase cache hits. For heavy inputs, for
example, images, generate a hash to use as a cache key. Set a conservative
time to live (TTL) for your cache (or serve cached results while updating them
in the background). Let the user trigger a fresh inference if the result is
unsatisfying.

**Don't:** Re-run the same inference for a repeated search query or identical data input where variability isn't desirable, for example when a user navigates back and forth between search results.
This optimizes responsiveness and efficient use of local compute.

## 6. Fallback strategies

Browser support for LanguageModel: Limited availability.
Supported by: Chrome 148 (May 2026).
Unsupported in: Edge, Firefox, and Safari.

Before use, check if the LanguageModel object is available in the global scope:

```js
if ('LanguageModel' in self) {
  // The Prompt API is supported.
} else {
  // Execute fallback strategy
}
```

If the Prompt API is unsupported or availability checks return 'unavailable', you must gracefully fall back:

* Remote API Fallback: Redirect the detection request to a server endpoint or a cloud API (such as the Vertex AI Gemini API).
* Local API Fallback: Redirect the detection request to a local endpoint, for example, using Transformers.js. 

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/built-in-ai/language-model.md#L360-L402). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. [Alternate upstream path](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/built-in-ai/prompt-api.md). Reorganized for this edition.
