- The implementation MUST use CSS logical properties (such as `margin-inline`, `padding-block`, `inline-size`, `block-size`) instead of physical directional properties (`margin-left`, `padding-top`, `width`, `height`) for layout spacing and sizing.
- The implementation MUST declare explicit `@layer` priority zones (e.g., `@layer reset, base, theme, components, utilities;`) to manage cascade specificity instead of BEM class naming conventions.
- The implementation MUST use `:has()` to style parent or container elements based on child or input states (such as `label:has(:checked)`) instead of toggling state classes via JavaScript.
- The implementation MUST NOT nest a `:has()` selector inside another `:has()` selector.
- The implementation MUST use `:is()` or `:where()` instead of duplicating CSS rules when grouping selectors or fallbacks, except for pseudo-elements.
- The implementation MUST use `:not()` to exclude irrelevant states (such as `button:hover:not(:disabled)`) rather than writing subsequent override rules to undo styles.
- The implementation MUST use `@scope (...) to (...)` rather than `:not()` descendant selectors (such as `.card :not(.content *)`) to exclude an inner subtree from component styles.
- The implementation MUST NOT apply global wildcard reset declarations (`* { ... }`) outside of a low-priority `@layer reset` block.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/css/css/expectations.md#L1-L8). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
