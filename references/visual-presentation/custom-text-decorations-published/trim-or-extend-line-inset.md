## Trim or extend the line with an inset

`text-decoration-inset` moves the start and end of the line. A positive value pulls an end inward, a negative value pushes it outward. One value moves both ends; two values set start and end separately. Percentages refer to the inline size of the decorated box.

```css
/* Small insets soften the ends of the line; larger ones read as a deliberately short line.
   Both values are examples. */
.trimmed  { text-decoration-inset: var(--deco-inset, 0.1em); }
.extended { text-decoration-inset: calc(var(--deco-inset, 0.1em) * -1); }
```

To reveal an underline on hover without a border or background gradient, trim the end by 100% and transition it back to 0:

```css
.reveal {
  text-decoration: underline; /* Always visible, including for reduced motion */
}

/* Only hide and animate the line when the user has not asked for reduced motion. */
@media (prefers-reduced-motion: no-preference) {
  .reveal {
    /* Trim the end by the full inline size so the line starts with zero length. */
    text-decoration-inset: 0 100%;
    /* 150ms to 300ms feels responsive without lagging; ease-out starts quickly. Example values. */
    transition: text-decoration-inset var(--reveal-duration, 0.25s) ease-out;
  }

  /* Include :focus-visible so keyboard users get the same reveal as pointer users. */
  .reveal:is(:hover, :focus-visible) {
    text-decoration-inset: 0 0;
  }
}
```

## Draw a custom line with a pseudo-element

Use a pseudo-element when the line must be a shape `text-decoration` cannot draw, such as a squiggle, and reveal it by clipping. No extra markup is needed, so the link stays a plain `<a>`.

```html
<a class="draw" href="#">Hover to draw underline</a>
```

```css
.draw {
  position: relative;
  display: inline-block;
  color: inherit;
  text-decoration: none;
  padding-block-end: 0.4em; /* Space for the line below the text; example value */
}

.draw::after {
  content: "";
  position: absolute;
  inset: auto 0 0 0;
  block-size: 0.4em; /* Height of the squiggle; example value */
  pointer-events: none;
  border: var(--deco-thickness, max(1px, 0.08em)) solid var(--deco-color, currentColor);
  /* A single shape strokes along its path, using the border width as the stroke. Example squiggle. */
  border-shape: shape(from 0% 50%,
    curve to 20% 50% with 5% 0% / 15% 100%,
    smooth to 40% 50% with 35% 100%,
    smooth to 60% 50% with 55% 100%,
    smooth to 80% 50% with 75% 100%,
    smooth to 100% 50% with 95% 100%);
}

/* Only hide and animate the line when the user has not asked for reduced motion;
   otherwise it stays fully drawn. */
@media (prefers-reduced-motion: no-preference) {
  .draw::after {
    /* Clip the line away from the right edge. The negative block insets keep the stroke
       from being cut off vertically. */
    clip-path: inset(-1em 100% -1em 0);
    /* A slightly slower draw than a hover reveal reads as drawing; example duration. */
    transition: clip-path var(--draw-duration, 0.6s) ease-out;
  }

  .draw:is(:hover, :focus-visible)::after {
    clip-path: inset(-1em 0 -1em 0); /* Fully drawn */
  }
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/visual-design/custom-text-decorations.md#L81-L164). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
