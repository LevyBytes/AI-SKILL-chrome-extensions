Related section: [Breadcrumbs](overview.md).
#### Fully irregular shapes (`border-shape`)

Use `border-shape` only for shapes `corner-shape` cannot make, such as a notched arrow with a concave leading edge. Define the polygon in a custom property (`--shape`) and apply it with `border-shape` so borders and focus outlines follow the shape. Polygons are physically directional and logical properties don't flip `polygon()` coordinates, so each shape needs an explicit `:dir(rtl)` mirror.

```css
/* The first item drops the inner notch vertex so its leading edge stays flat */
.breadcrumb > ol > li > a {
  --shape: polygon(0 0, calc(100% - var(--point)) 0, 100% 50%, calc(100% - var(--point)) 100%, 0 100%, var(--point) 50%);
  padding: .55rem calc(var(--point) + .8rem);
  border-shape: var(--shape);
}
.breadcrumb > ol > li:first-child > a {
  --shape: polygon(0 0, calc(100% - var(--point)) 0, 100% 50%, calc(100% - var(--point)) 100%, 0 100%);
}
/* Overlap by slightly less than --point so the notch and tip interlock */
.breadcrumb > ol > li + li { margin-inline-start: calc(.25rem - var(--point)); }
/* RTL mirror: swap 0 with 100% and calc(100% - var(--point)) with var(--point) in each x coordinate */
.breadcrumb:dir(rtl) > ol > li > a {
  --shape: polygon(100% 0, var(--point) 0, 0 50%, var(--point) 100%, 100% 100%, calc(100% - var(--point)) 50%);
}
.breadcrumb:dir(rtl) > ol > li:first-child > a {
  --shape: polygon(100% 0, var(--point) 0, 0 50%, var(--point) 100%, 100% 100%);
}
```

## 3. Optional UX enhancements

These are optional. Implement them only when the trail needs them, and choose the implementation yourself.

- **Sibling menus:** when ancestors have meaningful siblings (e.g. docs sections), let an ancestor expose its siblings in a menu. Keep the ancestor link navigating and put the toggle in a separate button, never inside the `<a>`. For menu mechanics, see `menu` (via `npx -y modern-web-guidance@latest retrieve "menu"`).
- **Long trails:** collapse the middle of a trail with more than 3 items on narrow containers instead of letting it wrap, keeping the first item and the last two. Put the hidden links in a popup opened from a "…" button, and keep the full trail when script is unavailable.
- **Long labels:** keep every item on one line and never truncate the current page. See `single-line-overflow` (via `npx -y modern-web-guidance@latest retrieve "single-line-overflow"`) for techniques for truncating ancestor labels and revealing the full label on demand without UX friction.

## Fallback strategy

### `corner-shape`

Browser support for corner-shape: Limited availability.
Supported by: Chrome 139 (Aug 2025) and Edge 139 (Aug 2025).
Unsupported in: Firefox and Safari.

- Rounded corners are not an acceptable fallback for slants and arrows. Keep plain bordered rectangular segments with a separator (`li + li::before`) as the base style, and put everything from the shape snippets that makes the shape (`corner-shape`, the radii, the padding, the overlap margins and `content: none` on the separator) inside `@supports (corner-shape: bevel)`, so unshaped segments neither overlap nor lose their separator.

### `sibling-index()` and `sibling-count()`

Baseline status for sibling-count() and sibling-index(): Newly available. It's been Baseline since 2026-08-18.
Supported by: Chrome 138 (Jun 2025), Edge 138 (Jun 2025), Firefox 154 (Aug 2026), and Safari 26.2 (Dec 2025).

- Without support, later segments paint on top: slants are unaffected, but arrow tips are hidden. Put the stacking rules in `@supports (z-index: sibling-index())`, and gate the arrow shape on both `corner-shape` and `sibling-index()` so it stays plain with a separator otherwise:

```css
@supports (corner-shape: bevel) and (z-index: sibling-index()) {
  /* Arrow-only shape, overlap and stacking rules from above */
}
```

### `border-shape`

Browser support for border-shape: Limited availability.
Supported by: Chrome 147 (Apr 2026) and Edge 147 (Apr 2026).
Unsupported in: Firefox and Safari.

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

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/breadcrumbs.md#L91-L168). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
