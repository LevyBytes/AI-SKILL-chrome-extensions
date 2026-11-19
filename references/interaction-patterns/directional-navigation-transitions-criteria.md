- Clicking the "Next" button triggers a view transition.
- Clicking the "Previous" button triggers a view transition.
- During the "Next" transition, the `forward` transition type is active on the document element.
- During the "Previous" transition, the `backward` transition type is active on the document element.
- During a `forward` transition, the `::view-transition-old(root)` element has an animation that translates it to -100% on the X-axis.
- During a `forward` transition, the `::view-transition-new(root)` element has an animation that translates it from 100% on the X-axis.
- During a `backward` transition, the `::view-transition-old(root)` element has an animation that translates it to 100% on the X-axis.
- During a `backward` transition, the `::view-transition-new(root)` element has an animation that translates it from -100% on the X-axis.
- The animations use the `transform` or `translate` property, and do not use `left`, `right`, `inset-inline-start` or `inset-inline-end`.
- The `::view-transition-group(root)` element has an animation duration between 0.2 and 0.6 seconds.
- The `::view-transition-group(root)` element uses a non-linear timing function (e.g. an `ease` keyword or `cubic-bezier()`), not `linear`.
- All view transition animations are disabled when `prefers-reduced-motion` is set to `reduce`.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/directional-navigation-transitions/expectations.md#L1-L12). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
