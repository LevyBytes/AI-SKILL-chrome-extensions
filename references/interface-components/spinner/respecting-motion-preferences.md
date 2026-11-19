#### Respecting Motion Preferences

Users with motion sensitivities may find fast-spinning elements disorienting. Always respect the `prefers-reduced-motion` media query. Set the internal `--_used-spinner-duration` property to override the user's `--spinner-duration` value, using the same selector as the spinner rule so that the override applies, and drop the dash animation so that only a slow rotation remains.

```css
@media (prefers-reduced-motion: reduce) {
  progress.loading-spinner:indeterminate {
    /* Slow down the animation significantly rather than stopping it entirely,
       so the user still knows that the process is active. */
    --_used-spinner-duration: 6s;
    /* Drops the dash animation, so the arc keeps a fixed length */
    --progress-dash-animation: ;
    --arc-end: 158deg;
  }
}
```

## Fallback strategies

{{ BASELINE_STATUS("registered-custom-properties") }}

If `@property` is supported, the dash animation is automatically included via the `--progress-dash-animation` property's `initial-value`. In browsers without `@property` support, the property registration is ignored, and the animation falls back to a simple rotation. No JavaScript is required for this fallback.

{{ BASELINE_STATUS("background-clip-border-area") }}

For browsers that don't yet support `background-clip: border-area`, fall back to a `mask-image` to hollow out the center.

```css
/* Fallback: use mask-image to create the ring */
@supports not (background-clip: border-area) {
  --clip-boundary: calc(100% - var(--thickness));
  mask-image: radial-gradient(
    farthest-side,
    transparent var(--clip-boundary),
    black var(--clip-boundary)
  );
  border: 0;
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/spinner/guide.md#L149-L187). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
