Related section: [Teaser](overview.md).
## Optional: blur the end of the faded text

Draw the blur with a pseudo-element over the end of the teaser. A mask on the pseudo-element ramps the blur in gradually, so there is no visible line where it starts.

MANDATORY: Put the pseudo-element on a parent of the faded element, not on the faded element itself. A `backdrop-filter` inside a masked element does not blur that element's text.

```html
<div class="teaser-blur">
  <div class="teaser">…</div>
</div>
```

```css
.teaser-blur {
  position: relative;
}

/* Starts fading before the blur starts: see below */
.teaser-blur .teaser {
  mask-image: linear-gradient(to top, transparent, black 9lh);
}

.teaser-blur::after {
  /* Example value: a small radius is enough, because the text also fades out */
  --blur: 0.1em;
  /* How far the pseudo-element extends past the text */
  --bleed: calc(2 * var(--blur));
  content: "";
  position: absolute;
  inset-inline: calc(-1 * var(--bleed));
  inset-block-end: calc(-1 * var(--bleed));
  /* Example value: how much of the text is blurred. Make it shorter than the fade. */
  block-size: calc(5lh + var(--bleed));
  backdrop-filter: blur(var(--blur));
  /* Ramps the blur in from the end of the text */
  mask-image: linear-gradient(to top, black 5lh, transparent);
}
```

- MANDATORY: Extend the pseudo-element past the text on the inline sides and at the end. `backdrop-filter` only paints inside its element, so without this bleed the blurred text is cut off in a straight line at the edges of the text.
- The bleed must be at least as large as the blur radius. A blur spreads further than its radius, so the snippet uses twice the radius.

Keep the fade on `.teaser`. The blurred text then fades into the background instead of ending at a hard edge.

- MANDATORY: Start fading the text before the blur starts, so the fade is longer than the blur (the snippet fades over 9lh and blurs over 5lh).
  - Blurred text looks heavier than crisp text at the same opacity. If both start at the same point, the text gets more prominent where the blur begins, then fades.
  - The blur only has the already-faded text to work with, so the fade cannot be so long that the blurred part is nearly transparent.
- Keep the blur radius small. The mask cross-fades sharp text with blurred text, so a large radius shows a ghost of the sharp text through the blur.
- To make the blur radius itself grow toward the end of the text, instead of cross-fading, stack 4–6 overlay elements over the end of the teaser.
  - Give each a larger `backdrop-filter: blur()` radius than the one before (e.g. `1px`, `2px`, `4px`, `8px`).
  - Give each a `mask-image` band that overlaps its neighbours, so the steps blend.
  - This costs one element and one compositing pass per step. DO NOT use an SVG filter (`backdrop-filter: url(…)`) to avoid the extra elements.

## Fallback strategies

### Fallbacks & browser support for masks

{{ BASELINE_STATUS("masks") }}

No fallback is needed. DO NOT add `-webkit-mask-image` declarations.

### Fallbacks & browser support for the `lh` unit

{{ BASELINE_STATUS("lh") }}

No fallback is needed.

### Fallbacks & browser support for `backdrop-filter`

{{ BASELINE_STATUS("backdrop-filter") }}

The blur is progressive enhancement: without `backdrop-filter`, the text is not blurred but still fades out. No fallback is needed.

`backdrop-filter` does not apply SVG filter references (`url(…)`) in Safari and Firefox, so an SVG-based blur renders no blur at all there.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/visual-design/teaser/guide.md#L43-L116). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
