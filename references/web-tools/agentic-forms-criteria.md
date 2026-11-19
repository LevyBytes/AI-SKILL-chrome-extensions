- The form element has both `toolname` and `tooldescription` attributes.
- Input elements have associated labels or `toolparamdescription` attributes.
- The `submit` event listener uses `event.preventDefault()`.
- The `submit` event listener checks `event.agentInvoked`.
- The `submit` event listener calls `event.respondWith()` with a Promise.
- The `:tool-form-active` pseudo-class is used to provide visual feedback.
- The `:tool-submit-active` pseudo-class is used to provide visual feedback for forms without `toolautosubmit`.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/webmcp/agentic-forms/expectations.md#L1-L7). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
