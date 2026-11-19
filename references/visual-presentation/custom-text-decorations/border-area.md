### Border area

{{ BASELINE_STATUS("background-clip-border-area") }}

If your Baseline target does not support `background-clip: border-area`, the declaration is ignored and the background paints under the whole border box, filling the text instead of only its outline. Do NOT settle for a plain solid border when the gradient is part of the design. Reproduce the gradient instead, and apply `background-clip: border-area` only inside `@supports`.

Use an opaque layer when the element's background is a known flat color. Paint the surface color over the padding box and the gradient under the border box, so the gradient shows only through the transparent border:

```css
.ring {
  border: var(--ring-width, max(2px, 0.12em)) solid transparent; /* Example width */
  /* Fallback: an opaque surface layer hides the gradient inside the border. */
  background:
    linear-gradient(var(--surface, canvas) 0 100%) padding-box,
    linear-gradient(135deg, var(--ring-start, #2563eb), var(--ring-end, #db2777)) border-box;
}

@supports (background-clip: border-area) {
  .ring {
    background: linear-gradient(135deg, var(--ring-start, #2563eb), var(--ring-end, #db2777)) border-box;
    background-clip: border-area; /* The inside stays transparent */
  }
}
```

Use a masked pseudo-element when the inside must stay transparent. The pseudo-element carries the gradient, and a mask cuts out everything but its padding ring:

```css
@supports not (background-clip: border-area) {
  .ring {
    position: relative;
    border-color: transparent;
  }

  .ring::before {
    content: "";
    position: absolute;
    inset: calc(var(--ring-width, max(2px, 0.12em)) * -1); /* Cover the border box */
    padding: var(--ring-width, max(2px, 0.12em)); /* Ring thickness */
    border-radius: inherit;
    background: linear-gradient(135deg, var(--ring-start, #2563eb), var(--ring-end, #db2777));
    /* Keep only the area between the content box and the border box. */
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask-composite: exclude;
    pointer-events: none;
  }
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/visual-design/custom-text-decorations/guide.md#L255-L303). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
