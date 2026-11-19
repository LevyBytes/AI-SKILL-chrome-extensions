## Best practices

- **MANDATORY**: Always set explicit `width` and `height` attributes on `<video>` elements. Unloaded videos have a `300`×`150` intrinsic size and will never load if they do not intersect a visible part of the page.
- **MANDATORY**: Always include the `controls` attribute on `<audio loading="lazy">` elements. Lazy-loaded `<audio>` elements without `controls` are not rendered visibly and will never load or autoplay.
- **DO NOT** apply `loading="lazy"` to above-the-fold or Largest Contentful Paint (LCP) `<video>` elements, as it delays fetching both the `poster` image and video data.
- **DO** omit the `loading` attribute when default eager loading is desired rather than explicitly writing `loading="eager"`.
- **DO NOT** rely on the `window` `load` event to detect when lazy-loaded `<video>` or `<audio>` elements have loaded. The `load` event fires based only on eager-loaded media, even if a `loading="lazy"` media element is initially inside the visual viewport.
- **DO** note that browsers only defer `loading="lazy"` media when JavaScript is enabled (an anti-tracking measure to prevent servers from inferring scroll position via media requests when scripting is disabled).

## Fallback strategy

{{ BASELINE_STATUS("loading-lazy-media") }}

If your Baseline target does not support `loading="lazy"` on `<video>` and `<audio>`, choose between progressive enhancement and an `IntersectionObserver` fallback based on how strictly bandwidth must be conserved:

### Progressive enhancement (recommended default)

Browsers that do not recognize `loading="lazy"` on `<video>` and `<audio>` ignore the attribute and fall back to standard loading governed by the `preload` attribute. Pairing `loading="lazy"` with `preload="none"` or `preload="metadata"` ensures unsupported browsers still avoid downloading the full media file upfront, though `<video poster>` images and `preload="metadata"` headers will be fetched eagerly.

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

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/lazy-load-video-and-audio/guide.md#L121-L202). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
