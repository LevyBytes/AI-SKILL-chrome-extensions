### Scroll-driven effects

{{ BASELINE_STATUS("scroll-driven-animations") }}

Treat slide effects as optional enhancements and keep them inside `@media (prefers-reduced-motion: no-preference)`. The carousel's navigation and current-slide feedback must not depend on them.

## Controls and status updates

Update the active marker as the track scrolls (throttled to one update per animation frame) so the dots keep pace with the visible slide, and run announcements and button state after scrolling settles. Measure only the carousel's scrolling axis.

Write a small script that adapts to your markup and covers these requirements:

- **Wire the HTML controls.** On a Previous or Next click, find the current slide from the track's scroll position along its scrolling axis, then scroll the track to the adjacent slide's snap position in visual order (which differs from DOM order when looping), for example with `track.scrollBy()` using that slide's offset from the track's center. Do not scroll by a fixed viewport width, keep a separate index that can drift from the real scroll position, or use `scrollIntoView()` without limiting it to the track, which can scroll the page. Create one named marker button per slide that scrolls the track to that slide. Keep the Previous and Next buttons before the track in DOM order.
- **Track the current slide** along the carousel's scrolling axis, for horizontal or vertical layouts.
- **Update the active marker live.** From a `scroll` listener throttled with `requestAnimationFrame`, compute the nearest slide and set the active marker's `aria-current="true"` immediately, and also set it from the pending target the moment a marker or Previous/Next button is clicked, so the dots change when the user decides instead of after the slide moves. Skip the write when the current slide is unchanged, and skip the listener entirely while a click or key press has a pending target, because recomputing every frame during a scripted smooth scroll makes Safari stutter.
- **Update the rest after scrolling settles**, from a single handler driven by the settled scroll position: update the buttons' disabled state (and slide parking when looping), and announce "Slide N of M" in the status region only when the settled slide changes from the previously settled slide (keeping initial load and compensating park scrolls silent). Controls only initiate scrolling; they never update state directly.
- **Settle on `scrollend`**, with a debounced `scroll` listener only where `scrollend` is unsupported. Do not run two settle handlers, and do not reorder or re-scroll the track (such as when parking a slide) while a scroll is still in flight, because that cancels it. The one exception is a marker click when looping, whose own scroll replaces the one in flight (see Looping).
- **Resolve clicks from a pending target.** Make rapid previous/next clicks build on the slide already being scrolled to, not on the nearest slide, and clear the target when scrolling settles. Ignore a `scrollend` that arrives after the next scroll has started, because acting on it (such as parking) cancels that scroll. Also ignore a settle at the exact scroll position where a scroll to another slide was just requested: it belongs to an earlier scroll (such as a compensating one), and the requested scroll has yet to move.
- **Respect reduced motion** for any smooth scrolling.

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

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/carousel/guide.md#L174-L217). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
