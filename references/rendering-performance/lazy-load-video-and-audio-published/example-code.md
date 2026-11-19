
```javascript
// Pause autoplaying videos when the user prefers reduced motion
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function syncReducedMotion(prefersReducedMotion) {
  for (const video of document.querySelectorAll('video[autoplay]')) {
    if (prefersReducedMotion) {
      video.removeAttribute('autoplay');
      video.pause();
    }
  }
}

syncReducedMotion(reducedMotionQuery.matches);
reducedMotionQuery.addEventListener('change', (event) => {
  syncReducedMotion(event.matches);
});
```

## Best practices

- **MANDATORY**: Always set explicit `width` and `height` attributes on `<video>` elements. Unloaded videos have a `300`×`150` intrinsic size and will never load if they do not intersect a visible part of the page.
- **MANDATORY**: Always include the `controls` attribute on `<audio loading="lazy">` elements. Lazy-loaded `<audio>` elements without `controls` are not rendered visibly and will never load or autoplay.
- **DO NOT** apply `loading="lazy"` to above-the-fold or Largest Contentful Paint (LCP) `<video>` elements, as it delays fetching both the `poster` image and video data.
- **DO** omit the `loading` attribute when default eager loading is desired rather than explicitly writing `loading="eager"`.
- **DO NOT** rely on the `window` `load` event to detect when lazy-loaded `<video>` or `<audio>` elements have loaded. The `load` event fires based only on eager-loaded media, even if a `loading="lazy"` media element is initially inside the visual viewport.
- **DO** note that browsers only defer `loading="lazy"` media when JavaScript is enabled (an anti-tracking measure to prevent servers from inferring scroll position via media requests when scripting is disabled).

## Fallback strategy

Browser support for Lazy-loading media: Limited availability.
Supported by: Chrome 150 (Jun 2026) and Edge 150 (Jul 2026).
Unsupported in: Firefox and Safari.

If your Baseline target does not support `loading="lazy"` on `<video>` and `<audio>`, choose between progressive enhancement and an `IntersectionObserver` fallback based on how strictly bandwidth must be conserved:

### Progressive enhancement (recommended default)

Browsers that do not recognize `loading="lazy"` on `<video>` and `<audio>` ignore the attribute and fall back to standard loading governed by the `preload` attribute. Pairing `loading="lazy"` with `preload="none"` or `preload="metadata"` ensures unsupported browsers still avoid downloading the full media file upfront, though `<video poster>` images and `preload="metadata"` headers will be fetched eagerly.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/performance/lazy-load-video-and-audio.md#L91-L131). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
