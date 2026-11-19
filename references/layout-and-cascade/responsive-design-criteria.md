- The implementation MUST use `@container` queries (`container-type: inline-size`) for component-level responsive layouts rather than relying exclusively on viewport `@media` queries.
- The implementation MUST use dynamic viewport units (`dvh`, `dvw`) instead of static `vh` or `vw` units for full-viewport sizing.
- The implementation MUST apply `aspect-ratio` to media containers or responsive `<img>` and `<video>` elements to prevent Cumulative Layout Shift (CLS).

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/css/responsive-design/expectations.md#L1-L3). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
