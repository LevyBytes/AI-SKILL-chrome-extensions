### `border-shape`

{{ BASELINE_STATUS("border-shape") }}

- Use `clip-path: var(--shape)` with the same polygon as the base style, and enhance inside `@supports (border-shape: polygon(0 0, 100% 0, 100% 100%))` by setting `clip-path: none` and applying `border-shape`.
- `clip-path` clips borders and outlines, so under the fallback use a color/background change plus negative `outline-offset` for focus instead of an outside outline.
- `clip-path` also cuts the slanted sides off a border, and `forced-colors: active` removes the background that draws the shape, so a clipped segment loses its outline. Under forced colors, drop the clip and use plain bordered segments with a text separator so the trail still reads as a path:

```css
@media (forced-colors: active) {
  /* Only without border-shape: with it, the border follows the shape and needs no change */
  @supports not (border-shape: polygon(0 0, 100% 0, 100% 100%)) {
    .breadcrumb > ol > li > a { clip-path: none; border: 2px solid LinkText; }
    .breadcrumb > ol > li + li { margin-inline-start: 0; } /* undo the shape overlap */
    .breadcrumb > ol > li + li::before { content: "›" / ""; } /* the shape no longer shows direction */
  }
}
```

- The trail remains fully functional; only borders and outlines differ.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/breadcrumbs/guide.md#L163-L182). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
