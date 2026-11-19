* The agent has defined an `@keyframes` block that animates `transform: scaleX()` from 0 to 1 (or similar scaling).
* The agent has applied the animation to the progress indicator element using `animation-timeline: scroll()`.
* The progress indicator element has `position: fixed` or `position: absolute` to stay in view.
* The progress indicator element has `transform-origin` set to the start (e.g., `0 50%` or `left`) so it scales from the correct side.
* The implementation includes feature detection using `@supports` for scroll-driven animations.
* The implementation respects user preferences for reduced motion using `@media (prefers-reduced-motion: no-preference)`.
* The purely decorative progress indicator element MUST either be empty (no text or image content) or define `aria-hidden="true"` to hide its content from assistive technology reading trees.
* The implementation DOES NOT add any `scroll` event listeners.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-atoms/scroll-progress-indicator/expectations.md#L1-L8). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
