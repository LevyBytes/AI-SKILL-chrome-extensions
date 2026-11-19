- The custom element class sets `static formAssociated = true` on its constructor and participates in the form via `ElementInternals` without rendering a hidden `<input>` element in the light DOM or shadow DOM.
- When the custom element is `required` and has an empty value, it matches `:invalid` and `form.checkValidity()` returns `false`.
- When the custom element is `required` and has an empty value, `form.reportValidity()` returns `false` and moves focus into the component (to the `setValidity()` anchor, or to an internal control via `delegatesFocus`).
- When the custom element is `required` and has an empty value, clicking the form's submit button does not fire the form's `submit` event.
- Selecting or setting a non-empty value on the custom element updates its `value` property and clears validity errors via `ElementInternals.setValidity({})` so the host matches `:valid` and `form.checkValidity()` returns `true`.
- Submitting the owning `<form>` includes the custom element's current value (set via `ElementInternals.setFormValue()`) in `FormData` under the element's `name` attribute.
- Resetting the owning `<form>` invokes `formResetCallback()` on the custom element, resetting its `value` to its initial empty or default state and re-evaluating validity.
- When the custom element is disabled, by its own `disabled` attribute or a disabled ancestor `<fieldset>`, its internal controls leave the tab order and clicking them does not change `value`. Re-enabling the ancestor `<fieldset>` re-enables the element unless it has its own `disabled` attribute.
- Invoking `formStateRestoreCallback(state)` on the custom element restores its `value` from the provided form state.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/html/form-associated-custom-elements/expectations.md#L1-L9). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
