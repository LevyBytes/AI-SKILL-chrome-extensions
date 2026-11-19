* The agent has defined named `view-timeline`s on the tracked elements.
* The agent has used `timeline-scope` on a common ancestor (e.g., `html` or `:root`) to make the named timelines accessible.
* The agent has applied animations to the target elements using `animation-timeline` linked to the named timelines.
* The agent has used `animation-range` to control the animation timing relative to the tracked elements.
* The implementation includes feature detection using `@supports` for scroll-driven animations.
* The implementation respects user preferences for reduced motion using `@media (prefers-reduced-motion: reduce)` (or `@media (prefers-reduced-motion: no-preference)`).

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/scrollytelling/expectations.md#L1-L6). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
