# Expectations: `faster-spa-view-transitions`

- Inactive view elements must have `content-visibility: hidden` applied in their computed styles.
- The active view element must not have `content-visibility: hidden` applied (it should be `visible` or default).
- The implementation must toggle the `content-visibility` state when switching between views.
- The implementation must use the `inert` attribute on inactive view elements (and remove it when active) to ensure they are hidden from keyboard users and the accessibility tree.
- The implementation should maintain focus management by moving focus to the active view container upon transition.
- If `content-visibility` is not supported, inactive view elements must have `display: none` applied in their computed styles.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/faster-spa-view-transitions/expectations.md#L1-L8). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
