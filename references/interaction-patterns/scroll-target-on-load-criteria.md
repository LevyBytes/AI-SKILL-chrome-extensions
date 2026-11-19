- The `.target` element MUST have an ancestor scroll container configured with scrolling (e.g., `overflow: auto`).
- The `.target` element MUST have the `scroll-initial-target: nearest` CSS property applied directly to it.
- Only a single element MUST have the `.target` class (`scroll-initial-target`) within the same scroll container.
- Media elements (e.g., embedded images) within the scroll container MUST have explicit dimensions applied (e.g., via `height`, `width`, or `aspect-ratio`) to prevent unpredictable layout shifts that would invalidate initial scroll coordinates.
- The implementation MUST NOT rely on JavaScript to calculate the initial scroll offset as its primary mechanism. The CSS property alone must manage the positioning to avoid a visible flash.
- A progressive enhancement JavaScript fallback MUST be included. It MUST evaluate native CSS capability using `!CSS.supports("scroll-initial-target", "nearest")` before executing any scroll logic.
- The fallback script MUST execute as soon as possible after the scroll container HTML is declared, and no later than `DOMContentLoaded`.
- Inside the fallback check, the script MUST scroll to the `.target` element using `element.scrollIntoView({ behavior: 'instant' })` to mimic the native discrete jump.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/scroll-target-on-load/expectations.md#L1-L8). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
