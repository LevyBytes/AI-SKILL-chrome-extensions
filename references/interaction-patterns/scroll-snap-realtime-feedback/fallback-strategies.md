## Fallback strategies
{{ BASELINE_STATUS("scroll-snap-events") }}
{{ BASELINE_STATUS("scroll-snap") }}

For browsers that do not support `scrollsnapchanging`, the UI will not provide eager feedback during the scroll gesture by default, and the linked UI will desynchronize from the content.

**MANDATORY:** Provide a fallback for browsers without support, or the linked UI will desynchronize from the content.

**DO** simulate the real-time nature of `scrollsnapchanging` with a `scroll` event listener coupled with `requestAnimationFrame` and geometric distance calculations to determine the closest snap target while the user is actively scrolling.

```javascript
if ('onscrollsnapchanging' in Element.prototype) {
  // Use native scroll snap events
} else {
  // Fallback: use scroll + requestAnimationFrame for eager feedback
  // (assumes the same container, thumbnails, items defined in step 1)
  let scrollTimeout;
  let rafId = null;

  const promotePendingToActive = () => {
    const closestIndex = findClosestItemIndex();
    if (!thumbnails[closestIndex]) return;
    thumbnails.forEach((thumb) => {
      thumb.classList.remove('pending', 'active');
      thumb.removeAttribute('aria-current');
    });
    thumbnails[closestIndex].classList.add('active');
    thumbnails[closestIndex].setAttribute('aria-current', 'true');
  };

  container.addEventListener('scroll', () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      const closestIndex = findClosestItemIndex();
      if (!thumbnails[closestIndex]) return;

      // DO NOT forget to clean up stale pending classes
      thumbnails.forEach((thumb) => thumb.classList.remove('pending'));
      thumbnails[closestIndex].classList.add('pending');
    });

    // Debounce fallback for browsers that don't support scrollend
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(promotePendingToActive, 100);
  }, { passive: true });

  // Fallback: use Baseline `scrollend` event to promote pending to active cleanly where supported
  container.addEventListener('scrollend', () => {
    clearTimeout(scrollTimeout);
    promotePendingToActive();
  });
}
```

The geometric `scroll` + `requestAnimationFrame` fallback closely emulates the behavior of native snap prediction, including handling programmatic scrolling correctly. Because functions like `scrollIntoView` naturally fire `scroll` events during their execution, the UI will stay smoothly synchronized throughout the scroll animation without requiring additional custom logic.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/scroll-snap-realtime-feedback/guide.md#L119-L175). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
