- The implementation MUST include a container element that may or may not contain a specific child element (e.g., an `<img>` or an `.icon`).
- The container element's styling (e.g., layout, flex-direction, padding, or background) MUST change based on the presence of that specific child element.
- The content-based styling MUST be implemented primarily using the CSS `:has()` pseudo-class to select the container based on the child's presence (e.g., `.container:has(img)`).
- If the content-based styling is critical to the component's functionality or layout, the implementation MUST include a fallback strategy for browsers that do not support the `:has()` selector.
- When a CSS fallback is implemented, it MUST use `@supports not selector(:has(*))` in CSS to provide alternative styling via a modifier class (e.g., `.has-image`).
- When a fallback is implemented, the strategy MUST either rely on server-side rendering to add the modifier class, or include a JavaScript feature detection block using `CSS.supports('selector(:has(*))')` to manually add the modifier class on the container element on load.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/css/content-based-styling/expectations.md#L1-L6). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
