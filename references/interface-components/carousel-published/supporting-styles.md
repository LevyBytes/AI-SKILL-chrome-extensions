### Supporting styles

Write these to fit the design:

- Style the markers as dots in a centered flex row with a gap, using the pointer cursor.
- Show a clear `:focus-visible` outline on the control and marker buttons.
- Set `touch-action: manipulation` on the track and the control buttons, so quick taps on them do not trigger double-tap zoom on touch devices.
- Keep the status region visually hidden without removing it from the accessibility tree.
- Enable `scroll-behavior: smooth` on the track only inside `@media (prefers-reduced-motion: no-preference)`.

## Fallback strategies

The controls are plain HTML, so the fallbacks below only cover the platform features that the script and CSS rely on. Scrolling and snap behavior remain native, and small amounts of script add the controls' behavior and status updates.

### Scrolling and completion

Baseline status for scroll-behavior: Widely available. It's been Baseline since 2022-03-14.
Supported by: Chrome 61 (Sep 2017), Edge 79 (Jan 2020), Firefox 36 (Feb 2015), and Safari 15.4 (Mar 2022).

Smooth scrolling is optional. The example enables it only when reduced motion is not requested.

Browser support for overscroll-behavior: Limited availability.
Supported by: Chrome 144 (Jan 2026), Edge 144 (Jan 2026), and Firefox 150 (Apr 2026).
Unsupported in: Safari.

Containing overscroll is a progressive enhancement and needs no fallback. Without support, a scroll that reaches an end of the track can scroll the page or start a swipe navigation, and the carousel still works.

Baseline status for scrollend: Newly available. It's been Baseline since 2025-12-12.
Supported by: Chrome 114 (May 2023), Edge 114 (Jun 2023), Firefox 109 (Jan 2023), and Safari 26.2 (Dec 2025).

If `scrollend` is unavailable, use a debounced `scroll` listener to run the settled-scroll handler. Run the initial marker, button, and parking sync once on load, leaving the polite status region empty until user-initiated scrolling settles so page load is not interrupted.

Browser support for Scroll snap events: Limited availability.
Supported by: Chrome 129 (Sep 2024) and Edge 129 (Sep 2024).
Unsupported in: Firefox and Safari.

The carousel does not depend on snap events. If they are unavailable, use settled-scroll tracking for status; use `scrollsnapchange` only when other UI must follow the browser-selected snap target.

### Scroll snap

Baseline status for Scroll snap: Widely available. It's been Baseline since 2020-01-15.
Supported by: Chrome 69 (Sep 2018), Edge 79 (Jan 2020), Firefox 68 (Jul 2019), and Safari 11 (Sep 2017).

The track remains natively scrollable with touch, pointer, and keyboard input. JavaScript adds the controls' behavior and announcements without replacing basic scrolling. Place the script in a `<script type="module">` element so it runs after the document has been parsed.

### Looping

Baseline status for sibling-count() and sibling-index(): Newly available. It's been Baseline since 2026-08-18.
Supported by: Chrome 138 (Jun 2025), Edge 138 (Jun 2025), Firefox 154 (Aug 2026), and Safari 26.2 (Dec 2025).

If `sibling-count()` is unsupported, the script supplies the number of slides instead, so the carousel still loops. Set a `--children-count` custom property on the track only when `CSS.supports("order: sibling-count()")` is false, and read the count in CSS as `var(--children-count, sibling-count())` instead of `sibling-count()`.
Browsers with support never get the property, so they keep counting natively.
Do not wrap the parking rules in `@supports`.

```css
.carousel-track > :first-child {
  /* --children-count is only set where sibling-count() is unsupported */
  order: clamp(0, var(--current) - (var(--children-count, sibling-count()) - 3), 1);
}
```

```js
if (!CSS.supports("order: sibling-count()")) {
  track.style.setProperty("--children-count", track.children.length);
}
```

If content is not static, update the property when slides are added or removed (e.g. via a `MutationObserver`).

### Scroll-driven effects

Baseline status for Scroll-driven animations: Newly available. It's been Baseline since 2026-10-27.
Supported by: Chrome 115 (Jul 2023), Edge 115 (Jul 2023), Firefox 159 (Oct 2026), and Safari 26 (Sep 2025).

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


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/carousel.md#L93-L182). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
