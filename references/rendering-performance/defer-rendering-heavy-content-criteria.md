# Expectations: `defer-rendering-heavy-content`

- Cards with class name `.off-screen-card` must be outside the initial viewport.
- Cards with class name `.off-screen-card` must set `content-visibility: auto`.
- Cards with class name `.off-screen-card` must set `contain-intrinsic-size`.

- The `.debug-panel` must be hidden using `content-visibility: hidden`.
- The `.debug-panel` must use a fallback strategy for unsupported browsers. The implementation must include a CSS feature detection check for native support (e.g., `@supports (content-visibility: hidden) { ... }`) and execute a fallback UI strategy for unsupported browsers.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/defer-rendering-heavy-content/expectations.md#L1-L8). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
