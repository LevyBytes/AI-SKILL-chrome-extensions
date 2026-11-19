* There is an underline element visible under the active tab item.
* The underline element is the width of the active tab item.
* The underline element's inline start edge is aligned to the active tab item's inline start edge.
* The underline element's inline end edge is aligned to the active tab item's inline end edge.
* The underline element's block start edge is positioned below the block end edge of the active tab item.
* The underline is drawn with a border, not a background or `box-shadow`, so it remains visible with `forced-colors: active` emulated.
* Changing the active page moves the underline element to be positioned underneath the new active tab item.
* When `prefers-reduced-motion: reduce` is enabled, there is no animation.
* When `prefers-reduced-motion: no-preference` is enabled, the underline animates.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/anchor-positioning-tab-underline/expectations.md#L1-L9). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
