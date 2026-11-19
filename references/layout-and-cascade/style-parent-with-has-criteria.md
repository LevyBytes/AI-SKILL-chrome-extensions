- On page load, the parent container wrapping the input should have neutral styling.
- Typing an invalid value (or typing and deleting to leave it empty) then clicking away (blur) MUST trigger the error state on the *parent container* (e.g., a border turns red or its background changes).
- Correcting the input MUST revert the parent container to the neutral state.
- The stylesheet MUST use `:has(:user-invalid)` scoped to a form field container rather than `body`.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/css/style-parent-with-has/expectations.md#L1-L4). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
