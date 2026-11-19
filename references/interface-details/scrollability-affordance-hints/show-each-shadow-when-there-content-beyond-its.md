### 3. Show each shadow when there is content beyond its edge

Pseudo-elements can query their own originating element, so the scroller's `::before` and `::after` respond to its scroll state.

```css
@container scroll-state(scrollable: block-start) {
  .scroller::before {
    opacity: 1;
  }
}

@container scroll-state(scrollable: block-end) {
  .scroller::after {
    opacity: 1;
  }
}
```

## Fades

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

## Accessibility considerations

Scrollability affordance hints are intended to supplement existing browser behaviour and help people be aware of larger scrollable regions. As a result of these hints being supplemental, and secondary to the primary hint (which would be the default scrollbar, or a sufficiently contrasting custom scrollbar), these scrollability affordance hints do not have to meet a specific contrast threshold. If the author wants to remove the scrollbar (which is not recommended for many usability reasons), then the scrollability affordance hint must have a contrast ratio of 3:1 against any immediately adjacent colours (to meet WCAG success criterion 1.4.11 Non-text Contrast), so that people are able to easily determine that scrolling is possible.

## Fallback strategies

Hints are an enhancement: without them, the scroller still works. If your Baseline target does not support the features below, omitting the hints is acceptable when the scrollbar is visible. If the scrollbar is hidden, the hints are the only cue that the region scrolls, so you MUST use a fallback.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-atoms/scrollability-affordance-hints/guide.md#L80-L164). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
