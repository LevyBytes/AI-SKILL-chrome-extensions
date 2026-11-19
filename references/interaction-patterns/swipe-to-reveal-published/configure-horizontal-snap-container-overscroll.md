### Step 2: Configure the horizontal snap container and `overscroll-behavior: chain`

When you wrap an element in an outer scroll container solely to create a swipe-to-reveal effect, that outer wrapper becomes an intermediate scroller inside the document (or another parent scroll container).

The four keywords of `overscroll-behavior` independently control whether excess scroll propagates to an ancestor scroll container (**scroll chaining**) and whether the container displays local overscroll affordances such as elastic rubber-band stretching or edge glow (**local boundary effect**):

| Value | Scroll Chaining (Propagates to Ancestor) | Local Boundary Effect (Rubber-band / Glow) | Role in Swipe-to-Reveal |
| :--- | :--- | :--- | :--- |
| `auto` | Yes | Yes | Default behavior; keep this on inner content scrollers where normal bounce feedback is desired, but avoid on the outer swipe wrapper where it causes the menu to bounce |
| `chain` | **Yes** | **No** | **Use on the outer `.SwipeReveal` scroller so excess scroll chains into the parent scroller (such as the document) without the menu or action strip bouncing** |
| `contain` | No | Yes | Traps scroll inside the container while still bouncing locally |
| `none` | No | No | Blocks both local bounce and scroll chaining to ancestors |

Make `.SwipeReveal` a two-column grid (`grid-template-columns: 100% max-content`) where `.SwipeReveal-content` snaps to `start` and `.SwipeReveal-panel` snaps to `end`:

```css
.SwipeReveal {
  /* Column 1: full-width content. Column 2: auto-sized actions or side menu. */
  display: grid;
  grid-template-columns: 100% max-content;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;

  /* Prevent the swipe wrapper and revealed panel from bouncing locally while
     still chaining excess scroll into the parent scroller (the document). */
  overscroll-behavior: chain;
}

@media (prefers-reduced-motion: no-preference) {
  .SwipeReveal {
    scroll-behavior: smooth;
  }
}

.SwipeReveal-content {
  scroll-snap-align: start;
  scroll-initial-target: nearest;
  background: Canvas;
}

.SwipeReveal-content:focus-visible {
  outline: auto;
  outline-offset: -2px;
}

.SwipeReveal-content.is-scrollable {
  block-size: 20rem;
  overflow: auto;
  /* Keeps default `overscroll-behavior: auto` so the content pane retains
     its normal bounce effect while chaining horizontal swipes to `.SwipeReveal`. */
}

.SwipeReveal-panel {
  /* Snapping a trailing panel to `end` (or a leading panel to `start`) brings
     all controls fully into view while keeping the adjacent edge of the content visible. */
  scroll-snap-align: end;
  display: flex;

  &:first-child {
    scroll-snap-align: start;
  }
}
```

> If you also want to reveal controls on the left (`inline-start`) side using three columns (`grid-template-columns: max-content 100% max-content`) or two columns (`max-content 100%`), place the leading `.SwipeReveal-panel` before `.SwipeReveal-content`. Because `.SwipeReveal-content` has `scroll-initial-target: nearest`, the scroll container initially rests on the content column rather than the leading panel.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/swipe-to-reveal.md#L45-L111). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
