- On page load, the required input field MUST have a neutral border (not red), even if it is empty.
- Focusing a required empty input field without editing (or while actively typing before blur) MUST NOT trigger the error state prematurely; entering an invalid value (or clearing a typed value) and clicking away (blur) MUST trigger the `:user-invalid` state (e.g. red border, visible error message) without writing custom JS event listeners.
- Typing a valid value MUST remove the error state immediately.
- Submitting the form with an invalid or empty required field MUST trigger the error state.
- Input format hints and password complexity rules MUST be positioned above the input element in the markup to prevent obstruction by mobile keyboards and linked via `aria-describedby`.
- Visual error feedback MUST incorporate multiple state indicators (e.g. an icon alongside border color changes) to avoid color-only communication.
- When a value doesn't meet a field's requirements, visible error text says so.
- A field has `aria-invalid="true"` while its error state is shown, and doesn't have `aria-invalid="true"` before the error appears or after it clears.
- After the form is submitted with an invalid field, focus is on the first invalid field.
- While a field has `aria-invalid="true"`, its accessible description includes its visible error text.
- On page load, no field's accessible description includes its error text.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/forms/validate-input-after-interaction/expectations.md#L1-L11). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
