#### Simple irregular shapes (`corner-shape`)

Prefer `corner-shape: bevel` with an irregular `border-radius` for parallelograms and arrows. It has better browser support than `border-shape` and keeps normal border flexibility (per-side widths, colors and styles), whereas `border-shape` needs explicit inner and outer shapes or is limited to a uniform stroke. Use logical corner properties so RTL mirrors automatically; no `:dir(rtl)` rule is needed.

Slant (`/`): bevel the start-start and end-end corners with a horizontal radius of the slant and a vertical radius of 100%.

Arrow (`>`): bevel both end corners with a horizontal radius of the point and a vertical radius of 50%. Overlap the next segment so the tip of each segment covers the flat start edge of the next.

```css
.breadcrumb { --slant: clamp(.4rem, 2cqi, .75rem); }
.breadcrumb > ol, .breadcrumb > ol > li { gap: 0; }
.breadcrumb > ol > li > a {
  display: block;
  corner-shape: bevel;
  /* Extra inline padding equal to the slant keeps text out of the angled corners */
  padding: .55rem calc(var(--slant) + .8rem);
}
/* The shape shows direction, so drop the separator */
.breadcrumb > ol > li + li::before { content: none; }

/* SLANT ONLY: leans like "/" in LTR and "\" in RTL */
.breadcrumb > ol > li > a {
  border-start-start-radius: var(--slant) 100%;
  border-end-end-radius: var(--slant) 100%;
}
/* Overlap by the slant, minus a small visible gap (example .25rem), so the angled edges run parallel */
.breadcrumb > ol > li + li { margin-inline-start: calc(.25rem - var(--slant)); }

/* ARROW ONLY: tip on the end side; a contrasting segment border separates the overlapped edges */
.breadcrumb > ol > li > a {
  border-start-end-radius: var(--slant) 50%;
  border-end-end-radius: var(--slant) 50%;
}
.breadcrumb > ol > li + li { margin-inline-start: calc(var(--slant) * -1); }
```

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

- **Sibling menus:** when ancestors have meaningful siblings (e.g. docs sections), let an ancestor expose its siblings in a menu. Keep the ancestor link navigating and put the toggle in a separate button, never inside the `<a>`. For menu mechanics, see {{ GUIDE_REF("menu") }}.
- **Long trails:** collapse the middle of a trail with more than 3 items on narrow containers instead of letting it wrap, keeping the first item and the last two. Put the hidden links in a popup opened from a "…" button, and keep the full trail when script is unavailable.
- **Long labels:** keep every item on one line and never truncate the current page. See {{ GUIDE_REF("single-line-overflow") }} for techniques for truncating ancestor labels and revealing the full label on demand without UX friction.

## Fallback strategy

### `corner-shape`

{{ BASELINE_STATUS("corner-shape") }}

- Rounded corners are not an acceptable fallback for slants and arrows. Keep plain bordered rectangular segments with a separator (`li + li::before`) as the base style, and put everything from the shape snippets that makes the shape (`corner-shape`, the radii, the padding, the overlap margins and `content: none` on the separator) inside `@supports (corner-shape: bevel)`, so unshaped segments neither overlap nor lose their separator.

### `sibling-index()` and `sibling-count()`

{{ BASELINE_STATUS("sibling-count") }}

- Without support, later segments paint on top: slants are unaffected, but arrow tips are hidden. Put the stacking rules in `@supports (z-index: sibling-index())`, and gate the arrow shape on both `corner-shape` and `sibling-index()` so it stays plain with a separator otherwise:

```css
@supports (corner-shape: bevel) and (z-index: sibling-index()) {
  /* Arrow-only shape, overlap and stacking rules from above */
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/breadcrumbs/guide.md#L74-L162). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
