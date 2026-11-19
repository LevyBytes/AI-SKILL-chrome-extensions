- A user action reorders the list items in the DOM so DOM order matches visual order.
- Item elements captured before a reorder are the same connected elements after the reorder, rather than being recreated.
- Items are reordered with `moveBefore()` when `Object.hasOwn(Element.prototype, 'moveBefore')` is true.
- When the reorder is animated, it runs inside a view transition started with `startViewTransition()`, guarded by feature detection.
- When the reorder is animated, each list item has a unique `view-transition-name` or uses `match-element`.
- The list element does not have `aria-live`, and one `role="status"` region has its text set once per reorder.
- Focus remains on the activated control after the reorder completes.
- When the reorder is animated, view transition animations are disabled when `prefers-reduced-motion: reduce` is active.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/dynamic-sort/expectations.md#L1-L8). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
