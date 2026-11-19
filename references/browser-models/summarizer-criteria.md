- The implementation uses `window.Summarizer` and does not use the deprecated `window.ai.summarizer` API surface.
- The implementation calls `Summarizer.availability()` to check model availability before creating the summarizer.
- The same options should be passed to both `Summarizer.availability()` and `Summarizer.create()`.
- The `Summarizer` instance's `summarize()` or `summarizeStreaming()` method should be used to generate a summary.
- A monitor for download progress should be implemented using the `downloadprogress` event.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/built-in-ai/summarizer/expectations.md#L1-L5). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
