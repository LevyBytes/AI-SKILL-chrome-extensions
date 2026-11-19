Related section: [State aware sticky headers](overview.md).
### Fallback strategies
Browser support for Container scroll-state queries: Limited availability.
Supported by: Chrome 144 (Jan 2026) and Edge 144 (Jan 2026).
Unsupported in: Firefox and Safari.

Scroll state queries are a progressive enhancement. In browsers that do not support `container-type: scroll-state`, the header will still stick to the top (due to `position: sticky`), but it will not visually transform. For most use cases, this is the recommended approach.

If stickiness is not essential, but `position: sticky` without different styling would be a worse experience than no stickiness at all, you can wrap the `position: sticky` and related declaration in an `@supports` query as well:

```css
.sticky-container {
  @supports (container-type: scroll-state) {
	  position: sticky;
	  top: 0;
	  container-type: scroll-state;
	  container-name: section-header;
	  z-index: 10;
	}
}
```
**Tip:** If your "stuck" styling requires a different background color for readability, consider setting your layout up so that the default styling works everywhere (Progressive Enhancement). If you must use a fallback, you can gate the `position: sticky` behaviour itself inside an `@supports (container-type: scroll-state)` query.

If the visual transformation is absolutely critical to the design (e.g., the stuck state introduces a background or compaction without which the content is unreadable), you can implement a robust JavaScript fallback using `IntersectionObserver`. You must duplicate your CSS styles under an `.is-stuck` class. The following generic polyfill checks `getComputedStyle` to traverse up and find the correct scroll container (defaulting to the viewport), matching the behavior of `@container scroll-state(stuck: top)`:

```javascript
function getScrollParent(node) {
  if (node == null || node === document.body || node === document.documentElement) {
    return null; // default to viewport
  }
  if (node.scrollHeight > node.clientHeight || node.scrollWidth > node.clientWidth) {
    const overflow = getComputedStyle(node).overflow;
    if (overflow !== 'visible' && overflow !== 'clip') {
      return node;
    }
  }
  return getScrollParent(node.parentNode);
}

document.querySelectorAll('.sticky-container').forEach(container => {
  const root = getScrollParent(container);
  
  const topOffset = parseFloat(getComputedStyle(container).top) || 0;
  
  const observer = new IntersectionObserver(
    ([e]) => {
      // Toggle the fallback class on the sticky header container
      e.target.classList.toggle('is-stuck', e.intersectionRatio < 1);
    },
    { 
      root: root,
      threshold: [1],
      rootMargin: `-${topOffset + 1}px 0px 0px 0px` 
    }
  );
  
  observer.observe(container);
});
```

*Note: This generic IntersectionObserver pattern can also be used as a polyfill for the `scroll-state(scrollable)` query.*

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-atoms/state-aware-sticky-headers.md#L89-L148). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
