* The target element's `translate` property is explicitly initialized to its identity value of `translate: 0` in CSS to maintain stable stacking context.
* The target element's `scale` property is explicitly initialized to its identity value of `scale: 1` in CSS to maintain stable stacking context.
* The target element's `rotate` property is explicitly initialized to its identity value of `rotate: 0deg` in CSS to maintain stable stacking context.
* DO NOT use the `will-change` property to ensure the stacking context.
* The target element has an active animation or transition on its `translate` property.
* The target element has an active animation or transition on its `rotate` property.
* When the target element is hovered, its `scale` property transitions to a new value.
* The `translate` and `rotate` animations continue to run (playState is 'running') even when the element is hovered and its `scale` is transitioning.
* The implementation includes a fallback strategy using `@supports` for browsers that do not support individual transform properties.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/css/individual-transform-properties/expectations.md#L1-L9). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
