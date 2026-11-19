- The implementation provides a boolean indicating if the page was initially loaded in the background.
- The implementation provides the precise time (in milliseconds) that the page was backgrounded.
- The implementation prefers the `VisibilityStateEntry` API (buffered performance entries) over `document.visibilityState`.
- The implementation includes a fallback to `document.visibilityState` for unsupported browsers.
- The implementation correctly identifies that `document.visibilityState` is unreliable for asynchronous scripts.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/detect-initial-visibility-state/expectations.md#L1-L5). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
