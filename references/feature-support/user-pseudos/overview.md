# User Pseudos (`:user-valid` / `:user-invalid`)

## Keep `aria-invalid` in sync { #aria-invalid }

Native `:user-invalid` does not automatically sync with ARIA attributes. Add the following JavaScript to keep `aria-invalid` in sync with the visual state:

* Set `aria-invalid="false"` until `:user-invalid` matches, rather than leaving it unset. Firefox and Safari expose an empty `required` field as invalid from page load, and Chromium doesn't expose an empty `required` field as invalid after interaction unless `aria-invalid="true"` is set.
* Link each field to its error message by setting the field's `data-error` attribute to the error message's `id` (`data-error="email-error"` for `<div id="email-error">`), and let the script list that `id` in `aria-describedby` only while the field is invalid. Don't reference the error from `aria-describedby` in the markup: the error element is always in the page, and text that `aria-describedby` references is announced even when it's hidden.
* Announce an error that appears when the user leaves or changes a field through one polite live region for the page, a moment later so it doesn't talk over the next field. Don't make each error message a live region: a live region that is shown, rather than changed, isn't announced reliably. After a failed submit, move focus to the first invalid field so that its error is announced instead.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/features/user-pseudos.md#L1-L10). [Upstream licensing terms](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/README.md#license). Reorganized for this edition.
