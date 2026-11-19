- On page load, the select menu should look neutral (no red border).
- Selecting a valid option MUST remove the error state.
- Selecting the "placeholder" option (if enabled) or submitting while empty MUST trigger the error state.
- CSS MUST use the `:user-invalid` pseudo-class for validation styling.
- CSS MUST NOT use the basic `:invalid` pseudo-class that triggers immediately.
- The select has `aria-invalid="true"` while its error state is shown, and doesn't have `aria-invalid="true"` before the error appears or after it clears.
- While the select has `aria-invalid="true"`, its accessible description includes its visible error text.
- On page load, the select's accessible description doesn't include its error text.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/forms/select-menu-interaction/expectations.md#L1-L8). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
