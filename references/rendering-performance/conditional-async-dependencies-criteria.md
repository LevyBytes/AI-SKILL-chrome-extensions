- The script checks if `popover` is in `HTMLElement.prototype` to determine if a polyfill is needed.
- If the feature is missing, a dynamic import is executed using top-level `await`.
- The conditionally loaded logic is implemented within a single module entry point, preventing simultaneous imports from multiple sibling modules.
- A functional popover element and a button with a `popovertarget` or `commandfor` attribute are present in the document.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/conditional-async-dependencies/expectations.md#L1-L4). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
