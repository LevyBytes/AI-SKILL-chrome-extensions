# Expectations: `interactions-in-complex-layouts`

- Target column elements must have `content-visibility: auto` applied in their computed styles.
- Target column elements must have a non-zero `contain-intrinsic-size` specified.
- The implementation must exhibit isolated layout recalculations (verifiable via performance traces showing smaller layout cost when items are mutated within columns).
- The application must not exhibit global reflows when dragging items between columns.
- If `content-visibility` is not supported, target column elements should have `contain: layout style paint` (or similar) applied to provide partial layout isolation.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/interactions-in-complex-layouts/expectations.md#L1-L7). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
