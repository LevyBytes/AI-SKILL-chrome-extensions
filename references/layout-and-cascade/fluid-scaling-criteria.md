- The component wrapper has `container-type: inline-size` (or `size`) applied.
- The component title has a `font-size` that uses container query units (like `cqi` or `cqw`).
- The component title uses `clamp()` to constrain the font size between a minimum and maximum value.
- The maximum size in `clamp()` for font size is at most 2.5 times the minimum size to meet accessibility guidelines.
- The container must not get smaller when zooming in with the browser, in order to meet accessibility guidelines.
- The font size of the title changes when the width of the container changes, independently of the viewport size.
- A fallback font size using viewport units (like `vw`) or media queries is provided for browsers that do not support container query units.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/css/fluid-scaling/expectations.md#L1-L7). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
