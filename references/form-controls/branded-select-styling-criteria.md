- The implementation MUST apply `appearance: base-select` to the `<select>` element to opt into the customizable select behavior.
- The implementation MUST apply `appearance: base-select` to the `::picker(select)` pseudo-element to enable custom styling for the options dropdown.
- The implementation MUST use the `::picker(select)` pseudo-element to define the visual container for the options list (e.g., borders, shadows, background).
- The implementation MUST use `select::picker-icon` to customize the drop-down arrow icon.
- The implementation MUST use `option::checkmark` to customize the checkmark indicator for the selected option.
- If a custom trigger button is used, the markup includes a `<button>` element inside the `<select>` to replace the default trigger button.
- If a custom trigger button is used, it MUST include a `<selectedcontent>` element to display the active option, and the `<select>` MUST NOT contain a legacy `<selectedoption>` element to mirror selections.
- The colors MUST have a contrast of at least `3:1` with the background color.
- The implementation MUST NOT use JavaScript as the primary mechanism for toggling the dropdown or styling the picker.
- The `<select>` MUST have a `name` attribute and an associated `<label>`. This ensures that even with a custom UI, the component remains accessible to screen readers and works correctly with standard form submissions.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/forms/branded-select-styling/expectations.md#L1-L10). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
