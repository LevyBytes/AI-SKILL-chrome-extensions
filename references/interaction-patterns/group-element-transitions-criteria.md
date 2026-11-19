- Multiple elements on the page have a `view-transition-class` property set to the same value.
- Every element with a `view-transition-class` also has a unique `view-transition-name`.
- There are no repeated `view-transition-name` values.
- The stylesheet contains a `::view-transition-group` rule targeting that class name.
- The `::view-transition-group` rule targeting that class specifies a time duration (via `animation-duration` or the `animation` shorthand).
- The `::view-transition-group` rule targeting that class uses a non-linear timing function—either an explicit `ease*` keyword, `cubic-bezier()`, or multi-stop `linear()` curve (via `animation-timing-function` or `animation`), or the default `ease` value—and does not set the `linear` keyword or `steps()`.
- A `@media (prefers-reduced-motion: reduce)` rule sets the `animation` of `::view-transition-group(*)`, `::view-transition-old(*)` and `::view-transition-new(*)` to `none`.
- New elements (entering) are transitioned using `::view-transition-new(...):only-child`.
- Removed elements (exiting) are transitioned using `::view-transition-old(...):only-child`.
- DOM updates that change the list are wrapped in a `document.startViewTransition` call.
- If `document.startViewTransition` is not defined, the DOM updates are made immediately.
- The "Add" button is interactive during the transition.
- The `::view-transition` pseudo-element has `pointer-events: none` to allow interaction with elements below the transition layer.
- The `view-transition-name` on `:root` is set to `none` to disable the root view transition.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/group-element-transitions/expectations.md#L1-L14). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
