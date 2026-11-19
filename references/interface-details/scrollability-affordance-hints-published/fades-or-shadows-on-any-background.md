#### Fades, or shadows on any background: `IntersectionObserver`

Use an `IntersectionObserver` to mark which edges have more content, and show the hints from those attributes. Observe the scroller's first and last children, with the scroller as the root and `threshold: 1`: a child that is not fully visible means there is more content beyond it.

```js
if (!CSS.supports('animation-timeline', 'scroll()')) {
  for (const scroller of document.querySelectorAll('.scroller')) {
    const [first, last] = [scroller.firstElementChild, scroller.lastElementChild];
    // rootMargin: without it, sub-pixel widths can leave an edge child a fraction of a pixel short of fully visible
    const observer = new IntersectionObserver(entries => {
      for (const { target, intersectionRatio } of entries) {
        scroller.classList.toggle(target === first ? 'more-start' : 'more-end', intersectionRatio < 1);
      }
    }, { root: scroller, threshold: 1, rootMargin: '1px' });

    observer.observe(first);
    observer.observe(last);
  }
}
```

```css
/* Shadows */
.scroller.more-start::before,
.scroller.more-end::after {
  opacity: 1;
}

/* Fades */
.scroller {
  transition: --fade-start .2s, --fade-end .2s;

  &.more-start {
    --fade-start: var(--fade-size);
  }

  &.more-end {
    --fade-end: var(--fade-size);
  }
}
```

If a single child can be larger than the scroller (e.g. one long article), it is never fully visible, so this would always show both hints. Observe sentinels instead: empty elements that the script adds at each end of the scroller. A sentinel that is out of view means there is more content beyond it.

```js
// Must be valid children of the scroller (e.g. <li aria-hidden="true"> in a list)
const [start, end] = [document.createElement('div'), document.createElement('div')];
for (const sentinel of [start, end]) {
  // A zero-size sentinel at the very edge never counts as intersecting
  sentinel.style.cssText = 'min-inline-size: 1px; min-block-size: 1px';
}
scroller.prepend(start);
scroller.append(end);
// Observe them as above, with the default threshold, using !isIntersecting instead of intersectionRatio < 1
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-atoms/scrollability-affordance-hints.md#L224-L278). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
