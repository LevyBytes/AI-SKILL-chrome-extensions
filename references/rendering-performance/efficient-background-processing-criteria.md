# Expectations: `efficient-background-processing`

- The target element must have `content-visibility: auto` applied in its computed styles.
- The target element must have a non-zero `contain-intrinsic-size` applied to provide a placeholder height.
- The application must respond to the `contentvisibilityautostatechange` event.
- The application must pause active canvas animations or high-frequency tasks when the `contentvisibilityautostatechange` event reports `skipped: true`.
- The application must resume active canvas animations or high-frequency tasks when the `contentvisibilityautostatechange` event reports `skipped: false`.
- If `content-visibility` is not supported, the application must use `IntersectionObserver` to pause tasks when the element leaves the viewport.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/efficient-background-processing/expectations.md#L1-L8). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
