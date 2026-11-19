- The component wrapper has `container-type: inline-size` (or `size`) applied.
- The component uses `@container` queries to apply different styles based on the container's width.
- The component changes layout (e.g., from stacked to side-by-side) when the container width crosses a specific threshold (e.g., `400px`).
- A fallback strategy using media queries or a default safe layout is provided for browsers that do not support container queries.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/css/size-aware-styling/expectations.md#L1-L4). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
