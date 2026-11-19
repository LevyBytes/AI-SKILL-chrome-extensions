- The `<dialog>` element must have the `closedby="any"` attribute.
- The `<dialog>` element should have an accessible name using `aria-labelledby`, `aria-label`, or similar.
- The dialog must be opened with the `showModal()` method when the trigger button or link is clicked.
- Clicking the backdrop (the area outside the dialog content) must close the dialog.
- Pressing the `Esc` key must close the dialog.
- Clicking the close or cancel button inside the dialog must close the dialog.
- Clicking inside the dialog content (but not on the backdrop) should NOT close the dialog.
- The implementation should include a fallback mechanism for light-dismiss in browsers where the `closedby` attribute is not supported.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/light-dismiss-a-dialog/expectations.md#L1-L8). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
