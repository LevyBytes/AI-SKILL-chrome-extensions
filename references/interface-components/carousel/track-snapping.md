### Track and snapping

The track is a flex row that scrolls on the inline axis and snaps to slides. Each slide fills the track and snaps to center.

```css
.carousel-track {
  display: flex;
  gap: 1rem; /* example value */
  overflow-x: auto;
  /* mandatory so the track always rests on a slide, which the settled-scroll status relies on */
  scroll-snap-type: x mandatory;
  /* keep a scroll that reaches either end on the carousel; only the scrolling axis, so the page still scrolls the other way */
  overscroll-behavior-x: contain;
}

.carousel-track > * {
  flex: 0 0 100%; /* one slide per view; use a smaller basis for a peek layout */
  scroll-snap-align: center;
}
```

### Controls

Position the Previous and Next buttons over the track's start and end edges (a `position: absolute` container with a `z-index` so slides don't cover them, and `pointer-events: none` on the container with `pointer-events: auto` on the buttons so the track stays scrollable between them). Build the marker buttons from the slides' `data-marker-name` values, and style the active one with `[aria-current="true"]`.

```css
.carousel-markers button[aria-current="true"] {
  background: #0a5; /* example color; any clear contrast with the other markers works */
}
```

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

{{ BASELINE_STATUS("scroll-behavior") }}

Smooth scrolling is optional. The example enables it only when reduced motion is not requested.

{{ BASELINE_STATUS("overscroll-behavior") }}

Containing overscroll is a progressive enhancement and needs no fallback. Without support, a scroll that reaches an end of the track can scroll the page or start a swipe navigation, and the carousel still works.

{{ BASELINE_STATUS("scrollend") }}

If `scrollend` is unavailable, use a debounced `scroll` listener to run the settled-scroll handler. Run the initial marker, button, and parking sync once on load, leaving the polite status region empty until user-initiated scrolling settles so page load is not interrupted.

{{ BASELINE_STATUS("scroll-snap-events") }}

The carousel does not depend on snap events. If they are unavailable, use settled-scroll tracking for status; use `scrollsnapchange` only when other UI must follow the browser-selected snap target.

### Scroll snap

{{ BASELINE_STATUS("scroll-snap") }}

The track remains natively scrollable with touch, pointer, and keyboard input. JavaScript adds the controls' behavior and announcements without replacing basic scrolling. Place the script in a `<script type="module">` element so it runs after the document has been parsed.

### Looping

{{ BASELINE_STATUS("sibling-count") }}

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


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/carousel/guide.md#L82-L173). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
