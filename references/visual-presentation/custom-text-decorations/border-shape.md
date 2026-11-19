### Border shape

{{ BASELINE_STATUS("border-shape") }}

If your Baseline target does not support `border-shape`, the declaration is ignored and the element keeps its rectangular border. A rounded rectangle is only an acceptable fallback when the shape is purely decorative. When the shape carries meaning, such as a tag, arrow, or callout, reproduce it as closely as possible, and apply `border-shape` only inside `@supports`.

Draw the outline with a clipped pseudo-element. Keep a transparent border so the box is the same size as in the supported case, fill the pseudo-element with the outline color, and cut it into a ring with an `evenodd` `clip-path`: the outer shape, then the same shape inset by the stroke width.

```css
.tag {
  --stroke: max(2px, 0.08em); /* Example stroke width */
  position: relative;
  padding: 0.2em 1.5em 0.2em 0.9em; /* Example values */
  border: var(--stroke) solid transparent;
}

@supports not (border-shape: circle(50%)) {
  .tag::before {
    content: "";
    position: absolute;
    inset: calc(var(--stroke) * -1); /* Cover the border box */
    background: var(--shape-color, currentColor);
    pointer-events: none;
    /* Outer shape, then the inner shape inset by the stroke. The inner points are approximate on
       diagonal edges, so the stroke looks slightly thinner there. */
    clip-path: polygon(evenodd,
      0 0, 85% 0, 100% 50%, 85% 100%, 0 100%,
      var(--stroke) var(--stroke),
      calc(85% - var(--stroke)) var(--stroke),
      calc(100% - var(--stroke) * 2) 50%,
      calc(85% - var(--stroke)) calc(100% - var(--stroke)),
      var(--stroke) calc(100% - var(--stroke)));
  }
}

@supports (border-shape: circle(50%)) {
  .tag {
    border-color: var(--shape-color, currentColor);
    border-shape: polygon(0 0, 85% 0, 100% 50%, 85% 100%, 0 100%);
  }
}
```

For a filled shape rather than an outline, put `clip-path: polygon(...)` with the same points directly on the element.

For the pseudo-element underline, draw a straight line with `border-block-end` on `.draw::after`, and apply the `block-size`, `border`, and `border-shape` squiggle only inside `@supports (border-shape: circle(50%))`. The line is straight but still draws on, because the `clip-path` animation does not depend on the shape.

`clip-path` also clips focus rings and `box-shadow`. Do not rely on an outline on the clipped element to show focus; style `:focus-visible` with a color or background change instead.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/visual-design/custom-text-decorations/guide.md#L304-L351). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
