* The agent has defined an `@keyframes` block that animates the `transform` or `translate` property (e.g., `translateY`) to create the parallax effect.
* The agent has defined a `view-timeline` on the wrapper element or uses an anonymous view timeline.
* The agent has applied the `animation-timeline` property to the layers to link them to the timeline.
* The agent has staggered the animations across different layers (e.g., using `sibling-index()` or hardcoded offsets) so they move at different rates.
* The wrapper element has `overflow: clip` or `overflow: hidden`.
* The implementation includes feature detection using `@supports` for scroll-driven animations (e.g., checking for `animation-timeline`).
* The implementation respects user preferences for reduced motion using @media (prefers-reduced-motion).

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/parallax-scroll-effects/expectations.md#L1-L7). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
