```yaml
---
name: masonry-layout
description: Pack items of varying heights into tightly stacked columns so shorter items rise to fill the vertical gaps left by taller neighbors, avoiding the ragged bottom edge of a standard grid.
draft: stub
web-feature-ids:
  - grid-lanes
---
```

# Masonry Layout

## Implementation notes for guide authors

- Migrate and expand the masonry guidance from `guides/css/css-layout/guide.md` (`## 8 Grid lanes (aka masonry)`) into this dedicated guide, and replace that section in `css-layout` with a pointer to `{{ GUIDE_REF("masonry-layout") }}`.
- Cover `display: grid-lanes` (and `@supports` progressive enhancement) alongside fallback strategies (`columns` with `break-inside: avoid` for document fragments vs. `grid-auto-flow: dense` for non-interactive grids, noting DOM/tab-order constraints).

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/css/masonry-layout/guide.md#L1-L14). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
