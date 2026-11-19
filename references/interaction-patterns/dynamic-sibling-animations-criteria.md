* The animation on the first element starts before the animation on the second element.
* `sibling-index()` is multiplied by a time and used as the `animation-delay`.
* The implementation provides a fallback for older browsers using CSS custom properties.
* The native `sibling-index()` delay is wrapped in an `@supports` block with a literal time condition rather than overriding the custom-property fallback unconditionally.
* The custom property values start at 1 and increment for each sibling.
* The fallback is applied conditionally only when `sibling-index()` is not supported.
* If the user prefers reduced motion, the animation is disabled.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/dynamic-sibling-animations/expectations.md#L1-L7). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
