Related section: [Scroll snap state sync](overview.md).
## Fallback strategies

Browser support for Scroll snap events: Limited availability.
Supported by: Chrome 129 (Sep 2024) and Edge 129 (Sep 2024).
Unsupported in: Firefox and Safari.

If `scrollsnapchange` is not supported, use `IntersectionObserver` to detect which element is currently at the top of the scroller. Note this is different behavior than `scrollsnapchange`, as this will trigger while the scroll happens, rather than only when the scroll has settled.

```javascript
// Feature detect support for scroll snap events
if (!('onscrollsnapchange' in HTMLElement.prototype)) {
  const headers = main.querySelectorAll('h2');
  const observer = new IntersectionObserver(
    () => {
      // Account for any top border on the scroll container so scrollportTop
      // matches the IntersectionObserver root's padding-box top.
      const scrollportTop =
        main.getBoundingClientRect().top + main.clientTop;
      const topEntry = [...headers].reduce((currentTop, header) => {
        // Use the bottom to handle scrolling up, when the top is still offscreen
        const { bottom } = header.getBoundingClientRect();
        // Exclude targets whose bottom has scrolled past the 1px top rootMargin
        if (bottom <= scrollportTop + 1) return currentTop;
        if (!currentTop) return header;
        return bottom < currentTop.getBoundingClientRect().bottom
          ? header
          : currentTop;
      }, undefined);
      if (topEntry) setActiveLink(topEntry.id);
    },
    {
      root: main,
      // Inset top by 1px so adjacent sections stop intersecting when snapped to start
      rootMargin: '-1px 0px 0px 0px',
      // Fire both when a target exits/enters (0) and when a heading settles into view (0.9)
      threshold: [0, 0.9],
    },
  );

  // Observe all snap targets (e.g., section headers)
  headers.forEach((header) => observer.observe(header));
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/scroll-snap-state-sync.md#L81-L123). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
