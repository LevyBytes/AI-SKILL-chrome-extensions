### Custom code fallback (`IntersectionObserver`)

When your Baseline target requires strictly deferring `<video poster>` downloads, `preload="metadata"` requests, or viewport-triggered playback in browsers without native support, feature-detect `Object.hasOwn(HTMLMediaElement.prototype, 'loading')`, then fall back to `IntersectionObserver`:

```javascript
// Feature-detect native media lazy loading on HTMLMediaElement.prototype
const supportsLazyMedia = Object.hasOwn(HTMLMediaElement.prototype, 'loading');

if (!supportsLazyMedia) {
  const lazyMediaElements = document.querySelectorAll(
    'video[loading="lazy"], audio[loading="lazy"][controls]',
  );

  // Example-only rootMargin value; adjust distance threshold for your layout
  const mediaObserver = new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        const media = entry.target;

        // Restore deferred poster and preload attributes when entering the viewport
        if (media.dataset.poster) {
          media.poster = media.dataset.poster;
          delete media.dataset.poster;
        }

        if (media.dataset.preload) {
          media.preload = media.dataset.preload;
          delete media.dataset.preload;
        }

        if (media.dataset.src) {
          media.src = media.dataset.src;
          delete media.dataset.src;
        }

        for (const source of media.querySelectorAll('source[data-src]')) {
          source.src = source.dataset.src;
          delete source.dataset.src;
        }

        media.load();
        observer.unobserve(media);
      }
    },
    { rootMargin: '200px 0px' },
  );

  for (const media of lazyMediaElements) {
    // Hold back network fetches in unsupported browsers until intersection
    if (media.hasAttribute('poster')) {
      media.dataset.poster = media.getAttribute('poster');
      media.removeAttribute('poster');
    }
    if (media.hasAttribute('preload') && media.getAttribute('preload') !== 'none') {
      media.dataset.preload = media.getAttribute('preload');
    }
    media.preload = 'none';
    mediaObserver.observe(media);
  }
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/performance/lazy-load-video-and-audio.md#L132-L194). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
