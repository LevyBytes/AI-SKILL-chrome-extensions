- The `<link rel="preload" as="image">` for 'poster.jpg' has the `fetchpriority="high"` attribute.
- The `<link rel="preload" as="font">` for 'brand-font.woff2' does NOT use the `fetchpriority="high"` attribute.
- The `<link rel="preload" as="font">` for 'secondary-font.woff2' has the `fetchpriority="low"` attribute.
- The `<link rel="preload" as="font">` includes the `crossorigin` attribute.
- No more than two `<link rel="preload" as="image">` elements on the entire page have the `fetchpriority="high"` attribute.
- No `<link>` elements have the deprecated `importance` attribute.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/optimize-preload-priority/expectations.md#L1-L6). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
