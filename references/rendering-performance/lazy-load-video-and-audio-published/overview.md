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

## Example code

```html
<!-- Above-the-fold hero video: DO NOT use loading="lazy".
     Omit loading (defaults to "eager") so the poster and initial media load immediately. -->
<video
  controls
  width="1280"
  height="720"
  poster="/images/hero-poster.jpg"
  preload="metadata"
>
  <source src="/media/keynote.webm" type="video/webm">
  <source src="/media/keynote.mp4" type="video/mp4">
  <track src="/media/keynote-en.vtt" kind="captions" srclang="en" label="English">
</video>

<!-- Below-the-fold video player:
     MANDATORY: Specify integer width and height attributes so the unloaded video
     has a non-zero layout box to intersect the viewport and avoids layout shift.
     Both the poster image and preload="metadata" are deferred until near the viewport. -->
<video
  controls
  loading="lazy"
  width="800"
  height="450"
  poster="/images/tutorial-poster.jpg"
  preload="metadata"
>
  <source src="/media/tutorial.webm" type="video/webm">
  <source src="/media/tutorial.mp4" type="video/mp4">
  <track src="/media/tutorial-en.vtt" kind="captions" srclang="en" label="English">
</video>

<!-- Below-the-fold inline product loop:
     With loading="lazy" and autoplay, downloading and playback wait until the
     video approaches the viewport. Include muted and playsinline for autoplay. -->
<video
  controls
  loading="lazy"
  autoplay
  loop
  muted
  playsinline
  width="640"
  height="360"
  poster="/images/feature-loop-poster.jpg"
>
  <source src="/media/feature-loop.webm" type="video/webm">
  <source src="/media/feature-loop.mp4" type="video/mp4">
  <track src="/media/feature-loop-en.vtt" kind="captions" srclang="en" label="English">
</video>

<!-- Below-the-fold audio player:
     MANDATORY: Include the controls attribute. Lazy-loaded <audio> without
     controls is invisible, cannot intersect the viewport, and will never load. -->
<figure>
  <figcaption id="episode-title">Episode 42: Browser Architecture Deep Dive</figcaption>
  <audio
    controls
    loading="lazy"
    preload="metadata"
    src="/media/episode-42.mp3"
    aria-labelledby="episode-title"
    aria-details="episode-transcript"
  ></audio>
  <details id="episode-transcript">
    <summary>View transcript</summary>
    <p>Transcript content for Episode 42...</p>
  </details>
</figure>
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/performance/lazy-load-video-and-audio.md#L1-L90). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
