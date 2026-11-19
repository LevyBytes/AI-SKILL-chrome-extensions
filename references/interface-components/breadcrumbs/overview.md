```yaml
---
name: breadcrumbs
description: Build a breadcrumb trail that shows the user's location within a site hierarchy and lets them navigate to ancestor pages.
web-feature-ids:
  - border-shape
  - corner-shape
  - sibling-count
  - forced-colors
  - focus-visible
  - clip-path
  - logical-properties
guides:
  - menu
  - icons
  - single-line-overflow
---
```

# Build breadcrumbs

Breadcrumbs show where the user is in a site hierarchy and link to each ancestor page.

This is not for switching between views of the same page (tabs) or for site-wide navigation (a navbar).

{# Maintainer note: the tabs, navbar, element-shape and overflow-popup guides are still empty shells, so they are not linked. When they are written, link tabs and navbar from the first sentence, element-shape from "Shaped segments", and overflow-popup from "Optional UX enhancements". #}

## 1. Semantics

- Wrap the trail in `<nav aria-label="Breadcrumbs">` containing an ordered list (`<ol>`) of `<li>` items, each holding an `<a>`. Order conveys hierarchy, so use `ol`, not `ul`.
- Give each `<nav>` a unique label if a page has several landmarks (e.g. "Breadcrumbs").
- Mark the current page, the last item, as a link with `aria-current="page"`. Keep it a link (not plain text) so the trail structure stays consistent.
- Dividers are decorative. Do not put them in the markup as text. Generate them in CSS with an empty alt so they stay out of the accessibility tree:

```css
/* The empty alt text after the slash hides the divider from screen readers; li + li skips the first item */
.breadcrumb > ol > li + li::before { content: "/" / ""; }
```

- A styled character (`/`, `›`, `>`) generated as above is the simplest divider. For an icon divider such as a chevron, render it the way the codebase renders icons and keep it decorative; see {{ GUIDE_REF("icons") }}.

## 2. Styling

- Lay out with `display: flex; flex-wrap: wrap; align-items: center; gap` on the `<ol>`; reset list styles.
- Whatever the visual style, the trail must read as a path: each step visibly follows the previous one through a separator (slash or chevron) or an arrow or slant shape. Plain links with a separator are the default and the safest choice.
- **DO NOT** drop the separator in chip-like styles. Pills, tags and a segmented bar without one look like tabs or filters (items on the same level), not a hierarchy. Plain text with no divider is also weak, since order is then the only cue; avoid it.
- Choose a visual variant:
  - **Plain (slash or chevron):** use when the trail should stay visually quiet. Underline links at rest, or at least on hover and focus, so they never rely on color alone.
  - **Bar:** one bordered, segmented container with `overflow: clip`; use when segments need large, clear touch targets. Keep a separator in each segment after the first. A bar must not wrap: when its segments no longer fit on one row, stack it in a column in a container query set just above the bar's natural width (measure it and round up, so it stacks only when it would not fit), with compact rows (smaller block padding), separated by a 1px `border-block-start` and the chevron turned to point down and use a fixed `border-radius` for a joined pill, since `999px` becomes an oval once it grows tall. For a joined pill, round the container (`border-radius: 999px`) and separate segments with a 1px `border-inline-start` and no gap. Give the current page's `<li>` the same background as its link, so the chevron outside the link does not sit on the bar's background. Round the container, not the individual links, so the clip handles the end caps, and give the end links the same end radius so an inset focus ring follows the rounded ends instead of being cut off.
  - **Pills / tags:** use rounded or shaped links when the trail is a prominent control, with a separator between them. Show backgrounds only on hover for tags.
- Style the current page distinctly (weight, color) and non-current links with a hover state.
- Custom palettes must meet WCAG AA contrast (4.5:1 for text) for links, hover, and the current page against their actual backgrounds (e.g. dark red on light gray). Keep a non-color cue on the current page, such as font weight.
- Provide a clear `:focus-visible` outline that has a contrast of at least `3:1` with the background color. For shaped or clipped segments use a negative `outline-offset` or a background/color change, since outlines get clipped.
- Lift the focused link above its neighbors (`position: relative; z-index: 1` on `a:focus-visible`). Neighbors that overlap it (shaped segments) are painted later and cover an outside ring.
- In `forced-colors: active`, restore borders and an underline on `[aria-current="page"]` since backgrounds are removed. An icon divider drawn as a masked background also needs `forced-color-adjust: none` and a system color such as `CanvasText`, since forced colors replaces the background.

### Shaped segments

Pick the simplest technique that produces the shape, and use **one** shape per trail. The snippets are alternatives, not meant to be combined.

- Selectors are illustrative; use your own hook (`.breadcrumb` here). Scope to `> ol > li > a`.
- Make the slant or point size responsive with `clamp()` and container units (`cqi`).
- Pair state colors with the shape: hover and current-page styles must use background or text color, not border color. Keep the focus style visually distinct from hover.
- Use a negative `outline-offset` for focus, since outside outlines are covered by neighbors.

#### Overlapping segments

Overlapping segments communicate hierarchy even without a separator. Pull each segment under the previous one with a negative inline margin, and stack them in reverse source order so each earlier segment sits above the next. `sibling-index()` and `sibling-count()` make this possible without per-item rules:

```css
.breadcrumb > ol > li { position: relative; z-index: calc(sibling-count() - sibling-index()); }
/* The focused segment sits above every other segment (the li is the stacking context, so lift it, not the link) */
.breadcrumb > ol > li:has(> a:focus-visible) { z-index: calc(sibling-count() + 1); }
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/breadcrumbs/guide.md#L1-L73). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
