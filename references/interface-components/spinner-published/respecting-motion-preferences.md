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

Baseline status for Registered custom properties: Newly available. It's been Baseline since 2024-07-09.
Supported by: Chrome 85 (Aug 2020), Edge 85 (Aug 2020), Firefox 128 (Jul 2024), and Safari 16.4 (Mar 2023).

If `@property` is supported, the dash animation is automatically included via the `--progress-dash-animation` property's `initial-value`. In browsers without `@property` support, the property registration is ignored, and the animation falls back to a simple rotation. No JavaScript is required for this fallback.

Browser support for background-clip: border-area: Limited availability.
Supported by: Chrome 150 (Jun 2026), Edge 150 (Jul 2026), and Safari 18.2 (Dec 2024).
Unsupported in: Firefox.

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

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/spinner.md#L138-L179). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
