- The scroll container has `scroll-snap-type: y proximity` or `scroll-snap-type: y mandatory` applied.
- The section headers or containers within the container have `scroll-snap-align: start` applied.
- When the user scrolls to a section, the corresponding link in the Table of Contents (TOC) is visually highlighted (e.g., is styled based on  `[aria-current=true]` class).
- When a TOC link is selected, it should have appropriate accessibility attributes like `aria-current="true"` or  `aria-current="location"`.
- When the user scrolls to a section, only one TOC link is highlighted as the active one.
- The implementation uses the `scrollsnapchange` event listener on the scroll container to synchronize the TOC state when scroll settles.
- The scroll container has an accessible name provided using `aria-label` or `aria-labelledby`.
- The scroll container has an accessible role of `role="region"` if it does not already have an implicit role.
- The scroll container can receive focus with `tabindex="0"`.
- The implementation includes a fallback (such as `IntersectionObserver`) for browsers that do not support the `scrollsnapchange` event.
- Clicking a TOC link causes the container to scroll to the corresponding section.
- The section target element that has an ID, acting as the target for the related TOC link, has a `tabindex="-1"` attribute, so that it can receive focus.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/scroll-snap-state-sync/expectations.md#L1-L12). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
