- The `<dialog>` element must use the `@starting-style` at-rule to define starting property values for its entry animation.
- The `[popover]` element must use the `@starting-style` at-rule to define starting property values for its entry animation.
- Both the `<dialog>` and `[popover]` elements must include `overlay` and `display` in their `transition` property and set `transition-behavior: allow-discrete`.
- When the dialog or popover is opened, it must smoothly transition from its starting styles to its visible styles.
- When the dialog or popover is closed, it must smoothly transition to its base (closed) styles before being removed from the top layer and layout.
- The `::backdrop` pseudo-element for the dialog should also be animated (e.g., transition `background-color`).
- The implementation must respect user preferences for reduced motion using the `prefers-reduced-motion` media query by disabling or simplifying transitions (e.g., removing transforms and shortening durations).

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/animate-to-from-top-layer/expectations.md#L1-L7). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
