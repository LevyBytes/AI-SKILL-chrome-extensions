Related section: [Scroll completion effects](overview.md).
## Fallback strategies

{{ BASELINE_STATUS("scroll-promises") }}

In browsers that do not support scroll method promises, `scrollIntoView()`, `scroll()`, `scrollTo()`, and `scrollBy()` return `undefined` instead of a `Promise`.

- **Progressive enhancement (default `await` behavior)**: Because `await undefined` is valid JavaScript that resolves immediately on the next microtask, writing `await element.scrollIntoView({ behavior: 'smooth' })` will not throw an error in unsupported browsers. Instead, it degrades gracefully by running the post-scroll code as soon as the scroll begins. For non-critical visual flourishes like a temporary highlight, this is often sufficient.
- **Faithful fallback (`scrollend` + timeout)**: If your Baseline target does not support `scroll-promises` and the post-scroll action must wait until scrolling finishes in older browsers, check whether the return value is a `Promise` (`result instanceof Promise`). When it is `undefined`, wait for the `scrollend` event on the scroll container with a short fallback timeout in case the element is already in view and no scrolling occurs:

```javascript
function scrollIntoViewAsync(element, options, scroller = window) {
  const result = element.scrollIntoView(options);

  // Feature detect: in supporting browsers, scrollIntoView() returns a Promise
  if (result instanceof Promise) {
    return result;
  }

  // Fallback for browsers where scrollIntoView() returns undefined
  return new Promise((resolve) => {
    let timeoutId;

    const finish = () => {
      clearTimeout(timeoutId);
      scroller.removeEventListener('scrollend', finish);
      scroller.removeEventListener('scroll', onScroll);
      resolve();
    };

    const onScroll = () => {
      // Restart the idle timer on every scroll event. If scrollend never fires
      // (browsers without scrollend support), this resolves once scrolling goes idle.
      clearTimeout(timeoutId);
      timeoutId = setTimeout(finish, 100);
    };

    scroller.addEventListener('scrollend', finish, { once: true });
    scroller.addEventListener('scroll', onScroll, { passive: true });

    // If no scroll event fires within the idle window (e.g., already in view), resolve.
    // 100ms is an example value; it only needs to exceed the gap between scroll events.
    timeoutId = setTimeout(finish, 100);
  });
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/scroll-completion-effects/guide.md#L65-L109). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
