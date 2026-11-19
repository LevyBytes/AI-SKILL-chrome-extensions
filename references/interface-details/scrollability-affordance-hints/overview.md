```yaml
---
name: scrollability-affordance-hints
description: Build scroll shadows or fading edges that appear only when there's actually more content to scroll to in that direction.
web-feature-ids:
  - container-scroll-state-queries
  - scroll-driven-animations
---
```

# Scrollability Affordance Hints

## Overview

Scrollability hints show users that a region has more content in a given direction, and disappear at that end of the content. There are two kinds:

- **Shadows** are drawn over the edge of the scrollport, as if the content were tucked under it. Show them with scroll-state container queries on pseudo-elements of the scroller.
- **Fades** make the content itself fade out at the edge. Draw them with a mask on the scroller, driven by a scroll-driven animation.

Both need no scroll listeners and no extra elements in the markup.

## Choosing between a shadow and a fade

Use a **fade** when:
- The scroller scrolls horizontally through a row of items (tabs, chips, carousels). Items cut off by a fade read as "more of the same".
- The background is not a solid color (gradients, images, translucent surfaces). A mask makes content transparent instead of painting over it, so it works on any background.
- The scroller has no visible boundary. A fade needs no edge to tuck content under.

Use a **shadow** when:
- The content must stay legible right up to the edge (long text, tables, forms). A fade makes content near the edge hard to read.
- The scroller is bounded by fixed chrome, such as a dialog's header and footer or a table's sticky header. The shadow makes the chrome look raised above the content.

If neither applies, default to a shadow for vertical scrollers and a fade for horizontal ones.

## Shadows

### 1. Make the scroller a scroll-state container

```css
.scroller {
  overflow-y: auto;
  container-type: scroll-state;
}
```

### 2. Draw the shadows with `::before` and `::after`

DO NOT add indicator elements to the markup. The scroller's own `::before` and `::after` are its first and last children, so `position: sticky` keeps them at the edges of the scrollport. Their negative margins cancel out their height, so they take no space.

```css
.scroller::before,
.scroller::after {
  content: "";
  display: block;
  position: sticky;
  /* Example value: how far the shadow reaches into the content */
  block-size: .75rem;
  /* Paint above positioned content */
  z-index: 1;
  /* Let clicks through to the content underneath */
  pointer-events: none;
  opacity: 0;
  transition: opacity .2s;
}

/* Radial, so the shadow curves and tapers off at the sides. Keep it subtle: it should not compete with the content. */
.scroller::before {
  inset-block-start: 0;
  margin-block-end: -.75rem;
  background: radial-gradient(farthest-side at 50% 0, rgb(0 0 0 / .15), transparent);
}

.scroller::after {
  inset-block-end: 0;
  margin-block-start: -.75rem;
  background: radial-gradient(farthest-side at 50% 100%, rgb(0 0 0 / .15), transparent);
}
```

The pseudo-elements take part in the scroller's layout even while hidden. This works best when the scroller uses block layout, or a single-column grid or flex column layout.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-atoms/scrollability-affordance-hints/guide.md#L1-L79). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
