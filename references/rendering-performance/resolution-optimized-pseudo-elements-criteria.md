- A pseudo-element (`::before` or `::after`) is used on a target element.
- The pseudo-element has a standard image declaration (like `url()`) acting as a fallback for the `content` or `background-image` property.
- The pseudo-element uses the `image-set()` function for the same property, defined after the fallback.
- The `image-set()` function includes multiple pixel density descriptors (e.g., `1x` and `2x`).

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/resolution-optimized-pseudo-elements/expectations.md#L1-L4). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
