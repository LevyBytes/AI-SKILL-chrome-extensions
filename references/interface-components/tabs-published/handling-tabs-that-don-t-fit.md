## Handling tabs that don’t fit

Keep tabs on a single row. DO NOT wrap them onto multiple rows: wrapped rows make the tab order and the selected tab hard to follow.
When the tabs are wider than the available space, either scroll the tablist or move the tabs that don’t fit into a popup menu.
Optionally, also shrink the inactive tabs, so more tabs fit before either kicks in.

1. **Scrolling** keeps every tab in the tablist and in the keyboard order, and works with touch swiping. It needs no script beyond selection. Use it by default, and always on touch-first interfaces.
2. **An overflow menu** shows the names of all hidden tabs at once, in a list, without scrolling. Use it when there are a few primary tabs and a tail of less used ones, and users mostly use a pointer. It needs script to detect overflow.
3. **Shrinking inactive tabs** truncates their labels, so it suits tabs the user creates (e.g. open documents in an editor) better than a fixed set of tabs with short labels. Combine it with scrolling or an overflow menu.

### Strategy 1: scrolling

1. Make the tablist a horizontal scroll container: `display: flex`, `overflow-x: auto`, and `flex: none` on the tabs so they never shrink (unless combined with strategy 3).
2. Optional: snap to tab edges with `scroll-snap-type: inline proximity` on the tablist and `scroll-snap-align: start` on the tabs. Use `proximity`, not `mandatory`, so the user can still stop between tabs.
3. Hide the scrollbar and fade out each edge of the tablist that has more tabs beyond it, as described below. A fade suits a row of tabs better than a shadow, and works on any background. See `scrollability-affordance-hints` (via `npx -y modern-web-guidance@latest retrieve "scrollability-affordance-hints"`) for more details on scrollability hints.
4. On every selection change, scroll the selected tab into view with `scrollIntoView({ block: 'nearest', inline: 'nearest', container: 'nearest' })`. `container: 'nearest'` scrolls only the tablist, not the page. Clicking a partially visible tab then reveals it along with part of the next one, so mouse users without a horizontal scroll wheel can still reach every tab. It also covers selection without focus, such as find-in-page.

#### Fading the edges

Fade the content with a mask on the scroller itself: an opaque layer minus a gradient band at each end. Masking only the bands keeps everything else visible, including a focus outline on the scroller, which a single gradient clipped to the border box would hide. Animate each band's size with a scroll-driven animation on the scroller's own scroll position: each fade grows from 0 as the user scrolls away from that end, and shrinks back to 0 as they reach the other end. When the content fits, the scroll timeline is inactive and there is no fade.

```css
@property --fade-start {
  syntax: "<length>";
  inherits: false;
  initial-value: 0px;
}

@property --fade-end {
  syntax: "<length>";
  inherits: false;
  initial-value: 0px;
}

.scroller {
  overflow-x: auto;
  /* Example value: how far each fade reaches */
  --fade-size: 3rem;
  /* Gradient directions and positions are physical, so flip them for right-to-left content */
  --fade-dir: right;
  --fade-start-pos: 0;
  --fade-end-pos: 100%;
  mask:
    linear-gradient(black, black) no-clip subtract,
    linear-gradient(to var(--fade-dir), black, transparent) var(--fade-start-pos) 0 / var(--fade-start) 100% no-repeat no-clip,
    linear-gradient(to var(--fade-dir), transparent, black) var(--fade-end-pos) 0 / var(--fade-end) 100% no-repeat no-clip;
  animation: reveal-fade-start linear both, hide-fade-end linear both;
  animation-timeline: scroll(self inline);
  /* Each fade animates over the first or last --fade-size of scrolling */
  animation-range: 0 var(--fade-size), calc(100% - var(--fade-size)) 100%;

  &:dir(rtl) {
    --fade-dir: left;
    --fade-start-pos: 100%;
    --fade-end-pos: 0;
  }
}

@keyframes reveal-fade-start {
  to {
    --fade-start: var(--fade-size);
  }
}

@keyframes hide-fade-end {
  from {
    --fade-end: var(--fade-size);
  }
}
```

- MANDATORY: Register `--fade-start` and `--fade-end` with `@property`. Unregistered custom properties do not interpolate, so the fades would jump.
- Set `scroll-padding-inline` (or `scroll-padding-block`) to the fade size if the scroller uses scroll snapping or contains focusable items, so snapped and focused items never stop inside a fade.
- For vertical scrollers, use `to bottom`, put the bands at `0 0` and `0 100%` with sizes `100% var(--fade-start)` and `100% var(--fade-end)`, and use `scroll(self block)` and `overflow-y`.
- For right-to-left content, flip `--fade-dir` and swap the band positions, as in the `:dir(rtl)` rule above. The scroll timeline follows the writing direction, but gradient directions and mask positions are physical.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/tabs.md#L97-L172). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
