- Clicking a navigation control scrolls the corresponding target element into view using a programmatic scroll method (`scrollIntoView()`, `scrollTo()`, `scrollBy()`, or `scroll()`) with smooth behavior (`behavior: 'smooth'`).
- The implementation waits for the scroll operation to finish using the `Promise` returned directly by the scroll method, rather than relying on a hardcoded `setTimeout()` delay to guess when scrolling ends.
- Any active highlight or post-scroll state on previously targeted elements is cleared when a new scroll navigation is triggered.
- The post-scroll effect (such as adding a highlight class to the target element) is applied only after the scroll method's returned `Promise` resolves when scrolling settles, not synchronously while the smooth scroll is still in progress.
- Triggering a scroll to a target element that is already in view at its target position still resolves the awaited scroll call and applies the post-scroll effect without hanging.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/scroll-completion-effects/expectations.md#L1-L5). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
