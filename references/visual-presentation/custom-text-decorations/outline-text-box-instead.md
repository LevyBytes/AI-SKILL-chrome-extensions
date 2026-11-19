## Outline text with a box instead

Two box properties decorate text by outlining it rather than running a line along it. Give the text padding so the outline does not touch it.

```css
/* Gradient outline with a see-through middle */
.ring {
  padding: 0.2em 0.75em; /* Example values: enough room that the outline does not touch the text */
  /* The border width is the visible outline thickness. Relative to the font size, with a 2px
     minimum so it stays visible on small text; example value. */
  border: var(--ring-width, max(2px, 0.12em)) solid transparent;
  background: linear-gradient(135deg, var(--ring-start, #2563eb), var(--ring-end, #db2777)) border-box;
  /* Paint the background only under the border, so the inside stays transparent. */
  background-clip: border-area;
}

/* Border that follows a shape that border-radius cannot draw, such as a tag with a pointed end */
.tag {
  padding: 0.2em 1.5em 0.2em 0.9em; /* Example values: extra room at the point so the text is not clipped */
  border: var(--shape-stroke, max(2px, 0.08em)) solid var(--shape-color, currentColor); /* Example stroke width */
  /* A single shape strokes along its path. Two shapes fill the area between them.
     This polygon is an example; use shape() for curves. */
  border-shape: polygon(0 0, 85% 0, 100% 50%, 85% 100%, 0 100%);
}
```

`border-shape` replaces only the border. The background is still the rectangular box, so do not rely on it to fill a shape.

When only the corners need a different shape, such as a beveled, scooped, or notched label, use `corner-shape` with `border-radius` instead. It keeps the background and border following the corners, and unsupported browsers fall back to ordinary rounded corners.

```css
.label {
  padding: 0.2em 0.9em; /* Example values */
  border: var(--shape-stroke, max(2px, 0.08em)) solid var(--shape-color, currentColor);
  border-radius: 0.6em; /* Corner size; example value */
  corner-shape: bevel; /* round (default) | scoop | bevel | notch | square | squircle */
}
```

## Choose a technique

* **`text-decoration`** (line, ink skipping, spaces, inset): the line should run along the text, wrap with it, and follow its font metrics. This is the default choice.
* **Pseudo-element with `border-shape` and `clip-path`**: the line is a custom shape or needs a draw-on animation. Choose it only when `text-decoration-style` cannot produce the look, because it needs extra positioning. {# PENDING_GUIDE_REF: For vector path animations, see {{ GUIDE_REF("line-drawing-animation") }}. #}
* **`background-clip: border-area`**: the text needs a gradient outline. Use plain `border-color` when a solid outline is enough. {# PENDING_GUIDE_REF: For complete gradient border styling, see {{ GUIDE_REF("gradient-borders") }}. #}
* **`corner-shape`**: only the corners need a different shape, such as beveled, scooped, or notched. Pair it with `border-radius`, which sets the corner size.
* **`border-shape`**: the outline needs a shape `border-radius` cannot draw, such as a tag or arrow. Use `border-radius` when rounded corners are enough. {# PENDING_GUIDE_REF: For shaped element styling, see {{ GUIDE_REF("element-shape") }}. #}
* **Inset hover reveal**: worth adding when a link needs a hover affordance beyond a color change. Skip it for text that is not interactive.

## Fallback Strategies

Each fallback keeps the text readable and keeps the core decoration. Frame the need in terms of your Baseline target: if it includes browsers without a property, apply the matching fallback.

### Ink skipping `all`

{{ BASELINE_STATUS("text-decoration-skip-ink-all") }}

If your Baseline target does not support `text-decoration-skip-ink: all`, the declaration is ignored and the browser keeps `auto`. Latin descenders are still skipped; only scripts that `auto` does not cover, such as Japanese, lose ink skipping. This is graceful degradation, so no extra code is needed.

### Skip spaces

{# {{ BASELINE_STATUS("text-decoration-skip-spaces") }} #}

If your Baseline target does not support `text-decoration-skip-spaces`, the browser uses its own default handling of spaces. This is graceful degradation: the line is drawn under spaces the browser does not skip.

### Inset

{# {{ BASELINE_STATUS("tmp-text-decoration-inset") }} #}

If your Baseline target does not support `text-decoration-inset`, the
declaration is ignored, so the link keeps its normal, fully visible underline
and the transition has nothing to animate. This is graceful degradation: the
hover reveal is lost and the link stays underlined, so no `@supports` check is
needed.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/visual-design/custom-text-decorations/guide.md#L181-L254). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
