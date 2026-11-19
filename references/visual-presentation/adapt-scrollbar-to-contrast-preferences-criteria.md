* The agent has defined CSS variables (custom properties) for the scrollbar colors.
* The agent has provided a `@media (prefers-contrast: more)` block that updates the CSS variables to highly distinct colors (e.g., solid black or white) to ensure maximum legibility.
* The explicit scrollbar colors use the standard `scrollbar-color: var(--thumb) var(--track)` property.
* If a legacy fallback block is provided, it correctly inherits the high-contrast CSS variables and is safely isolated within an `@supports not (scrollbar-color: auto)` feature query.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/visual-design/adapt-scrollbar-to-contrast-preferences/expectations.md#L1-L4). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
