- The two-dimensional scroll container sets `overflow: auto` or `overflow: scroll` (with content overflowing in both axes) and declares `scroll-axis-lock: none` directly on itself rather than on an ancestor wrapper.
- The two-dimensional scroll container sets `overscroll-behavior: none` or `overscroll-behavior: contain` so panning into a boundary does not chain to the parent page or trigger browser overscroll navigation gestures.
- The scroll container is keyboard focusable with `tabindex="0"`, has a role that supports an accessible name (such as `region`) and an accessible name, and shows a visible `:focus-visible` indicator.
- `touch-action` is not restricted on the scroll container unconditionally; when present, it is scoped inside `@supports not (scroll-axis-lock: none)` and set to `pinch-zoom` rather than `none`.
- Any JavaScript `wheel` fallback doesn't cancel wheel events that have `ctrlKey` set, so Ctrl+wheel and trackpad pinch still zoom the page.
- Any JavaScript fallback pans by updating the container's `scrollLeft` and `scrollTop` rather than translating the content with CSS `transform`.
- Any JavaScript fallback is attached only when `CSS.supports('scroll-axis-lock', 'none')` is false.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/2d-panning/expectations.md#L1-L7). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
