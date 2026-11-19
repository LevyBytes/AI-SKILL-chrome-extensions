- The implementation MUST use `:user-invalid` and `:user-valid` rather than `:invalid` and `:valid` (and MUST NOT apply field validity styling to `input[type="range"]` sliders) for form validation styling so error states appear only after user interaction.
- The implementation MUST use `field-sizing: content` on auto-growing text inputs or `<textarea>` elements.
- The implementation MUST configure page-level browser UI theming (`accent-color` and `::selection`) and MUST NOT apply `user-select: none` to content text elements (such as `<p>` or headings) or their ancestors.
- Custom-styled choice controls MUST keep native form elements by styling `<select>` with `appearance: base-select` and `::picker(select)` or inline radio and checkbox options with `label:has(:checked)`, and submit actions MUST use `<button>` rather than `<input type="submit">`.
- The implementation MUST have a text color contrast between the foreground and background colors of at least 4.5:1 for regular size text or at least `3:1` for large-scale text (18 point or 14 point bold font size).
- The implementation MUST have a contrast between adjacent colors of at least `3:1` for non-text content.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/visual-design/browser-ui-theming/expectations.md#L1-L6). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
