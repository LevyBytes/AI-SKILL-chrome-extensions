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


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/lazy-load-video-and-audio/guide.md#L29-L120). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
