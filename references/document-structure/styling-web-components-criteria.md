- The component's shadow stylesheet sets the host's `display` with a `:host` rule.
- The component's shadow stylesheet does not use `:host-context()`.
- Public theming custom properties (such as `--card-bg`) are read with a `var()` fallback and are not declared on `:host`; private aliases on `:host` that read them (such as `--_card-bg: var(--card-bg, white)`) are allowed. Setting the public property on any Light DOM ancestor changes the host's or an internal element's computed style.
- The shadow tree exposes designated internal elements via the `part` attribute, and the outer stylesheet styles them across the shadow boundary using the `::part()` pseudo-element to change their computed styles.
- The element given `container-type: inline-size` (on the host or an internal wrapper) has a `display` property other than `inline` or `contents`, and a `@container` rule in the shadow stylesheet changes an internal element's computed style when the component's inline size crosses its breakpoint.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/html/styling-web-components/expectations.md#L1-L5). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
