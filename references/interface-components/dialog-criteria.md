- The overlay is a `<dialog>` with a non-empty accessible name (`aria-labelledby` or `aria-label`).
- A modal dialog is opened with `showModal()` or `command="show-modal"`, and `:modal` matches while it is open.
- Focus returns to the invoking element when a modal dialog closes.
- Pressing `Esc` closes an open modal dialog unless `closedby="none"` is set.
- A backdrop-click fallback, if present, does not close the dialog when a press starts inside the dialog and ends on the backdrop.
- While the dialog has unsaved changes, it has `closedby="none"`.
- While the dialog has unsaved changes, a cancel request leaves it open until the user confirms discarding them.
- While a modal dialog is open, content outside it is not focusable.
- No `<dialog>` has `role="dialog"` or `aria-modal`.
- While a modal dialog is open, scrolling over its backdrop or inside it does not scroll the page behind it.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/dialog/expectations.md#L1-L10). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
