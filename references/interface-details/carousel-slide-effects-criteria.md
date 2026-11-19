* An `@keyframes` rule defines states for at least the start (`0%` or `from`), center (`50%`), and end (`100%` or `to`) to animate each slide as it traverses the scrollport.
* Carousel items link their animation to a view progress timeline using either an anonymous `view()` timeline (such as `view(inline)`) or a named `view-timeline` (using a `<dashed-ident>` name such as `--item`).
* Feature detection uses `@supports` checking both scroll-driven timeline support (such as `animation-timeline: view()` or `view-timeline: --item`) and `animation-range: entry`.
* Animations respect user motion preferences using `@media (prefers-reduced-motion)`.
* The carousel scroller either contains a keyboard-focusable element or has `tabindex="0"`, a role that supports an accessible name, and an accessible name.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-atoms/carousel-slide-effects/expectations.md#L1-L5). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
