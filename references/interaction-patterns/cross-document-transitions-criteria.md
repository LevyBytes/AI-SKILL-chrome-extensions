- The `@view-transition` at-rule is defined with `navigation: auto` to enable cross-document transitions.
- The `@view-transition` rule is wrapped in a `prefers-reduced-motion: no-preference` media query to respect user accessibility settings.
- Custom animations are defined for different transition types using the `:active-view-transition-type()` pseudo-class (e.g., for "next" and "previous" directions).
- A `pagereveal` event listener is added to the `window` to dynamically add transition types to the `viewTransition` object.
- The page-level transition animations use `::view-transition-old(root)` and `::view-transition-new(root)` to create slide or fade effects.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/cross-document-transitions/expectations.md#L1-L5). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
