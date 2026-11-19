- The implementation MUST include a container element that contains an interactive child element (e.g., a checkbox, text input, or button).
- The container element's styling (e.g., background color, border color) MUST change based on a specific state of the child element (e.g., `:checked`, `:focus`, `:invalid`).
- The state-based styling MUST be implemented primarily using the CSS `:has()` pseudo-class to select the container based on the child's state (e.g., `.container:has(input:checked)`, `.container:has(input:focus)`).
- If the state-based styling is critical to the component's functionality, the implementation MUST include a fallback strategy for browsers that do not support the `:has()` selector.
- When a CSS fallback is implemented, it MUST use `@supports not selector(:has(*))` in CSS to provide alternative styling via a modifier class (e.g., `.is-active`, `.has-error`).
- When a fallback relies on user interaction, the fallback strategy MUST include a JavaScript feature detection block using `CSS.supports('selector(:has(*))')` to manually toggle the modifier class on the container element when the relevant event occurs in unsupported browsers.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/css/child-state-based-styling/expectations.md#L1-L6). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
