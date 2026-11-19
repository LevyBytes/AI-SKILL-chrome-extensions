- The layout container MUST apply `overflow: clip` to clip content without creating a scroll container.
- The implementation MUST apply a box-edge keyword (e.g., `content-box`) to configure inner curved clip margins on target layout containers.
- The implementation MUST apply a length value (e.g., `15px`) to configure extended offset clip margins establishing a visible safety zone to protect child element shadows from border box truncation.
- The implementation MUST apply `overflow: hidden` as the primary fallback style on containers requiring strict inner boundary box when `overflow: clip` is unsupported.
- The implementation MUST NOT apply `overflow: scroll` or `overflow: auto` on target elements when the visual intent is strictly clipping content without enabling scrolling functionality.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/css/overflow-clipping-control/expectations.md#L1-L5). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
