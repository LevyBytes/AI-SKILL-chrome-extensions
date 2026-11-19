## Progressive enhancement

{{ BASELINE_STATUS("overscroll-behavior") }}

{{ BASELINE_STATUS("scroll-snap") }}

{{ BASELINE_STATUS("scrollbar-width") }}

Treat `overscroll-behavior: chain` and `scrollbar-width: none` as progressive enhancements without JavaScript fallbacks:

- **Automatic CSS cascade fallback**: The initial value of `overscroll-behavior` is `auto`. Browsers that do not yet recognize the `chain` keyword ignore `overscroll-behavior: chain` at parse time and retain `auto`. Because `auto` already allows scroll chaining to ancestor scroll containers, both the swipe-to-reveal gesture and scroll chaining to the parent work across all browsers out of the box; supporting browsers simply suppress the unwanted rubber-band bounce on the outer swipe wrapper.
- **Overriding `contain` or `none`**: If a base stylesheet or utility class sets `overscroll-behavior: contain` or `none`, declare `overscroll-behavior: auto` immediately before `overscroll-behavior: chain` so browsers that do not yet support `chain` still chain scrolling to the parent rather than trapping it.
- **Scrollbar hiding (`scrollbar-width: none`)**: Hiding the horizontal scrollbar track is purely cosmetic; if an older engine ignores `scrollbar-width: none`, the swipe-to-reveal container remains fully functional with a standard scrollbar.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/swipe-to-reveal/guide.md#L216-L228). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
