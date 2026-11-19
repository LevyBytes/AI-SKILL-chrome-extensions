- Each switch control is a standard HTML `<input type="checkbox">` element with the `switch` attribute.
- Each switch input is associated with a `<label>` element (either by wrapping the `<input>` inside the `<label>` or via matching `for` and `id` attributes).
- Native switch support is feature-detected via `'switch' in HTMLInputElement.prototype`, and `input-switch-polyfill` is conditionally loaded only when native support is missing.
- When native switch support is missing, the checkbox input uses `appearance: none` to render switch styling while remaining visible and interactive (not visually hidden or clipped).
- Toggling the switch updates its `checked` state and visually updates the control's track styling between its unchecked and checked states.
- The switch input sets a custom `accent-color` that applies to both native switch rendering and the polyfilled switch's active state.
- Focusing the switch input via keyboard navigation (`:focus-visible`) displays a visible focus outline on the input itself.
- The switch's focus outline has a contrast ratio of at least 3:1 against the background next to it.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/forms/switch/expectations.md#L1-L8). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
