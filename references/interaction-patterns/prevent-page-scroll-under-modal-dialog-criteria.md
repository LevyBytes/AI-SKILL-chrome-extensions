- The `<dialog>` element is opened as a modal using `showModal()` so that it renders in the top layer with a `::backdrop` pseudo-element.
- When open as a modal, the `<dialog>` element has a computed `overscroll-behavior` (`overscroll-behavior-x` and `overscroll-behavior-y`) of `contain` or `none` to prevent scroll chaining from the dialog to the underlying page.
- When open as a modal, the `<dialog>` element is a scroll container (its computed `overflow-x` and `overflow-y` are `auto`, `scroll`, or `hidden`, and not `visible` or `clip`).
- The `dialog::backdrop` pseudo-element establishes a scroll container by having a computed `overflow` (`overflow-x` and `overflow-y`) of `hidden` or `auto`, and not `visible` or `clip`.
- The `dialog::backdrop` pseudo-element has a computed `overscroll-behavior` (`overscroll-behavior-x` and `overscroll-behavior-y`) of `contain` or `none` so scroll gestures over the backdrop do not chain to the underlying page.
- While the modal `<dialog>` is open, the `<html>` and `<body>` elements are not scroll-locked via `overflow: hidden` or `position: fixed`.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/prevent-page-scroll-under-modal-dialog/expectations.md#L1-L6). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
