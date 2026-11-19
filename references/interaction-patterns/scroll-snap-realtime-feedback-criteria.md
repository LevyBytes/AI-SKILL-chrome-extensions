- The element with class `.thumbnail` corresponding to the pending snap target receives the class `pending` during a scroll gesture on the `#gallery` element.
- The element with class `.thumbnail` corresponding to the final snap target receives the class `active` after the scroll gesture on the `#gallery` element completes.
- The element with class `.thumbnail` corresponding to the final snap target does not have the class `pending` after the scroll gesture on the `#gallery` element completes.
- The gallery contains child elements with class `.gallery-item`, one per photo.
- The gallery container has an accessible name provided using `aria-label` or `aria-labelledby`.
- The gallery container has an accessible role of `role="region"`.
- The gallery container can receive focus with `tabindex="0"`.
- The Nth `.thumbnail` element (in document order) corresponds to the Nth `.gallery-item` element (in document order).
- The number of `.thumbnail` elements must equal the number of `.gallery-item` elements.
- Each thumbnail is rendered as a `<button>` element with `aria-current="true"` applied to the currently-active thumbnail.
- The JavaScript implementation uses a feature detection check to determine if `scrollsnapchanging` is supported.
- When `scrollsnapchanging` is unsupported, the implementation provides a fallback that toggles `.pending` on the thumbnail corresponding to the `.gallery-item` nearest the viewport center during scrolling, and promotes it to `.active` when scrolling settles.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/scroll-snap-realtime-feedback/expectations.md#L1-L12). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
