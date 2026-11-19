## Looping (continuous navigation)

Loop previous and next navigation from the last slide to the first and back by keeping the track endless instead of disabling controls at the ends (unless the carousel has fewer than three slides or finite navigation is requested). Do not clone slides or move them in the DOM, which conflicts with frameworks and duplicates content for assistive technology. Instead, park an end slide beside the current one with CSS `order`, and only when the carousel is at or one step from that end. Parking one step early puts the neighbor in place before scrolling reaches an end, so the previous and next buttons never disable mid-scroll. The track then always has a neighbor on both sides, and keyboard scrolling, touch, and snapping all keep working. Only the first and last slides ever get `order`. Because parking starts one step before an end, a short carousel can have an end slide parked at every position (with 4 slides, always; with 3, both ends at the middle slide). DOM order applies unchanged only at positions that are more than one step from both ends, which needs 5 or more slides.

- Keep a `--current` custom property on the track: the zero-based index of the current slide. Do not give it a default in CSS: while it is undefined, `order` falls back to 0, so no slide is parked and the carousel starts on the first slide without JavaScript. The script sets it on load. Park the last slide before the first (`order: -1`) when `--current` is `0` or `1`, and park the first slide after the last (`order: 1`) when `--current` is the last or second-to-last index. Set `order` only on the first and last slides (`:first-child` and `:last-child`), not on every slide. `sibling-count()` is needed to find the last indexes. The formulas below are the part that is easy to get wrong.
- When scrolling settles, update `--current` from the scroll position. If the parking changes, measure the current slide's offset along the scrolling axis before and after, then instantly scroll by the difference in the same task so the change is invisible. Turn scroll snapping off (`scroll-snap-type: none`) around the reorder and the compensating scroll and restore it afterward, because some browsers otherwise re-snap to another slide and keep scrolling. Also lock overflow on the scrolling axis (`overflow-x: hidden`, or `overflow-y: hidden` for vertical) for the same step and restore it two animation frames later: Safari on iOS otherwise paints the reordered layout for a frame before the compensating scroll lands, which flickers. Restoring it immediately breaks looping, so keep the delay. This also applies when a parked slide is released after the user leaves an end slide.
- Markers must scroll in sequence order. A parked end slide sits on the opposite side of the track from its place in the sequence, so a direct scroll to it goes the short way round (from the first slide, the last slide's marker would scroll backward one step). On a marker click for any slide other than the current one, set `--current` to `initial` on the track before scrolling, so every slide is back in DOM order for the trip. Do it in the same measured, compensated step as parking, but without the overflow lock: Safari does not start the scroll that follows on a locked track. The settle handler then sets `--current` again, which re-parks. Do not do this for previous/next navigation, which must reach the parked slide to wrap. While the slides are in DOM order, an end slide has no neighbor to wrap to, so a Previous or Next click made during the trip cannot be followed yet. Hold it and replay it when scrolling settles and the slides are parked again, and skip the overflow lock for that parking step too, for the same reason.
- Looping needs at least three slides. Because the compensation is measured, slides may differ in size.
- The previous/next controls and the status calculation must work from visual order, not DOM sibling order. Per-slide labels ("2 of 4") and the status region use each slide's original index, which does not change when slides are parked. Do not renumber slides when `--current` changes.
- Keep `scroll-behavior: smooth` inside `prefers-reduced-motion: no-preference` for user navigation; only the compensating scroll is instant.

```css
/* The first slide parks after the last while --current is the last or second-to-last index. */
.carousel-track > :first-child {
  order: clamp(0, var(--current) - (sibling-count() - 3), 1);
}

/* The last slide parks before the first while --current is 0 or 1. */
.carousel-track > :last-child {
  order: calc(-1 * clamp(0, 2 - var(--current), 1));
}
```

Parking only changes visual order, so the DOM order stays as the reading and focus order, and no slide is inert or aria-hidden.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/carousel.md#L183-L206). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
