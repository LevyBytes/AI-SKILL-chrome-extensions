```yaml
---
name: lazy-load-video-and-audio
description: Defer downloading offscreen video and audio assets, including video poster images and preloaded media data, until the media player approaches the viewport to conserve bandwidth and reduce network contention during initial page load.
web-feature-ids:
  - loading-lazy-media
  - video
  - audio
  - intersection-observer
---
```

# Lazy load video and audio

Media elements (`<video>` and `<audio>`) and their associated resources (such as `<video poster>` images and preloaded metadata) consume significant network and storage bandwidth during initial page load. Even when `preload="metadata"` or `preload="none"` is set on a `<video>`, the browser eagerly fetches its `poster` image immediately, and `preload="metadata"` still initiates range requests for media headers across every player on the page.

Adding `loading="lazy"` to offscreen `<video>` and `<audio>` elements instructs the browser to defer all media network requests—including `poster` image downloads, `preload` hints, and `autoplay` execution—until the element reaches a browser-calculated distance from the visual viewport.

## How to implement

1. **Add `loading="lazy"` to offscreen media**: Apply `loading="lazy"` to `<video>` and `<audio>` elements positioned below the fold. Omit the `loading` attribute on above-the-fold media so it defaults to `eager`.
2. **Set explicit `width` and `height` on `<video>` elements**: Always specify integer `width` and `height` attributes (in CSS pixels) on `<video>`. Unloaded videos default to `300`×`150` dimensions; without explicit sizing, a lazy-loaded video may fail to intersect the visible viewport and never load, or cause disruptive layout shifts (CLS) when it loads.
3. **Include the `controls` attribute on `<audio>` elements**: Always include `controls` on `<audio loading="lazy">`. Because `<audio>` elements have no intrinsic visual box without browser controls, an `<audio loading="lazy">` element without `controls` cannot visibly intersect the viewport and will never load or autoplay.
4. **Coordinate `preload` and `poster` attributes**:
   - On `<video loading="lazy">`, both the `poster` image fetch and the `preload` behavior (`none`, `metadata`, or `auto`) are deferred until the video approaches the viewport.
   - Pair `loading="lazy"` with `preload="none"` when the user must explicitly press play after scrolling to the media, or `preload="metadata"` when duration and initial frame data should populate automatically once the player enters the viewport.
5. **Handle lazy `autoplay` safely**: When `loading="lazy"` is combined with `autoplay` on a muted `<video>` (or an opt-in `<audio controls>`), playback and downloading wait until the element approaches the viewport. Always respect `@media (prefers-reduced-motion: reduce)` before autoplaying motion media.

If the media is intended to autoplay, with audio playing for longer than 3 seconds then there must be a way to either pause, stop, or independently alter the volume of the audio, in order to adhere to WCAG 1.4.2 Audio Control.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/lazy-load-video-and-audio/guide.md#L1-L28). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
