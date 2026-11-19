#### Different actions per swipe direction

A single row can also expose **two different actions**: one for a left swipe and one for a right swipe (e.g., "archive" on right, "delete" on left), the way many native mail apps do it. The scroll, snap, and commit-detection mechanics don't change at all — the only thing that changes is what happens at commit time.

In Step 4, the `commit` function always calls `removeItem(...)`. To support two actions, pick the handler based on `direction`, and give each action its own button whose `data-direction` is the direction of the swipe it stands in for (Step 1):

```js
function commit(direction, entry) {
  if (item.classList.contains('is-removing')) return;
  const handler = direction === 'left' ? archiveItem : removeItem;
  handler(item, content, direction, entry);
  viewportObserver.unobserve(item);
  observer.disconnect();
}
```

A note on naming: `removeItem` is named for the destructive case, but the function it runs (collapse the row's height, slide the content off-screen, then drop the node) is really a generic "this row is done, animate it away" routine. It works just as well for archive, mark-as-read, or snooze — the row goes away from *this* list either way. If your handlers don't actually remove anything (e.g., both move the item elsewhere), rename it to something neutral like `dismissItem` so the code reads correctly.

To make the two actions visually distinct, hoist a color and icon for each direction onto the list item, then paint the track with a split gradient and the two pseudo-element icons from the same variables.

```css
.SwipeableList-item {
  /* Action color + icon per swipe direction. `--left-*` is revealed
     when the user swipes RIGHT (e.g., archive); `--right-*` is revealed
     when the user swipes LEFT (e.g., delete). */
  --left-action-color: hsl(140 50% 40%);
  --left-action-icon: url("…archive svg…");
  --right-action-color: hsl(0 65% 50%);
  --right-action-icon: url("…trash svg…");
}

.SwipeableList-item.is-initialized .SwipeableList-track {
  /* Split reveal: left half of the scrollable area gets the left-action
     color, right half gets the right-action color. `background-attachment:
     local` makes the gradient's positioning area the scrollable area
     (3x the visible width), so the default size fills it and the 50% hard
     stop lines up exactly with the midpoint of the resting content column.
     The track's color also stays continuous behind the content as it
     translates off, so the leading-direction color shows the whole way. */
  background-image: linear-gradient(
    to right,
    var(--left-action-color) 50%,
    var(--right-action-color) 50%
  );
  background-attachment: local;
}

/* Per-side icons read from the same variables. */
.SwipeableList-item.is-initialized::before { background-image: var(--left-action-icon); }
.SwipeableList-item.is-initialized::after  { background-image: var(--right-action-icon); }
```

With this setup, the spacers no longer need their own background-color (the track's gradient handles the reveal), so you can drop the `background-color` rule on `.SwipeableList-track::before, ::after` from Step 2 if you're using this dual-action variant.

## Best practices and pitfalls

- **DO** use `mandatory` snap, not `proximity`. With `proximity`, the row can rest partially scrolled, leaving the action background half-visible.
- **DO** set `overscroll-behavior-x: none` on the track. Without it, an over-swipe can trigger the browser's back-navigation gesture on iOS/Android.
- **DO** commit at a threshold *before* the snap settles (e.g., `commitThreshold ≈ 0.2`) rather than waiting for the content to be fully off-screen. This lets the remove animation start during the gesture, which feels significantly more responsive than waiting for the snap to land.
- **DO** drive per-item setup from an outer viewport `IntersectionObserver` rather than wiring every item up at page load. This avoids reading layout-dependent values (`clientWidth`, etc.) before items have been rendered, and keeps the active observer count proportional to what the user can actually see.
- **DO** use a `MutationObserver` on the list when items are added dynamically (initial render after data loads, infinite scroll, server push). Without it, items appended after page load won't get wired up.
- **DO NOT** rely on `pointerdown`/`pointermove`/`pointerup` to drive a manual transform. You'll lose the momentum, snap-back, and keyboard scrolling that native scrolling gives you for free.
- **DO** confirm destructive actions when appropriate. For "remove", consider showing an undo toast after the swipe completes; the gesture is fast and easy to trigger by accident. Also announce the result (for example, "Item One removed") by writing it into a `role="status"` element that is already in the page, because screen readers only announce changes to live regions that existed before the change.

## Accessibility considerations

To adhere to WCAG 2.5.1 Pointer Gestures, functionality must not be available solely through swiping gestures. Visible button elements are an accessible alternative way to activate the same functionality. Buttons provide people with disabilities, particularly people using voice control software, with a usable way of activating the same functionality. Make each button at least 24×24 CSS pixels (WCAG 2.5.8 Target Size (Minimum)), name it after the item it acts on, and ensure that there's a way of moving focus to the button and operating it using a keyboard alone. Once a row contains a button, don't add `tabindex` to the track: arrow keys on a focused track commit the action with no confirmation.

Another way of adhering to the 2.5.1 Pointer Gestures success criterion is by ensuring that the functionality exists elsewhere. For example, in an email app's inbox, if the email can be swiped left to be favorited, but this can also be achieved via a "Favorite email" button after navigating to an email, this would be sufficient, as long as that button can also be reached and operated with a keyboard. If the intended use case may require many repeated actions, this approach will be less usable, as it would require people with disabilities to have to spend more time accessing the alternative control. A menu opened with a long press that offers the same actions can also be a sufficient alternative, but it's often not as discoverable as permanently visible buttons. If the buttons only appear on hover or focus, also show them when the item is tapped, so touch users can reach them.

## Fallback strategies

{{ BASELINE_STATUS("scroll-snap") }}

{{ BASELINE_STATUS("intersection-observer") }}

{{ BASELINE_STATUS("mutationobserver") }}

{{ BASELINE_STATUS("resize-observer") }}

{{ BASELINE_STATUS("web-animations") }}

All newer features that are used are either not core to the experience or have robust fallbacks that can be reliably used now.

### Fallback for `overscroll-behavior`

{{ BASELINE_STATUS("overscroll-behavior") }}

No fallback is needed for this use case. Although `overscroll-behavior` has an interop issue that manifests on containers without scrollable overflow, the track here is always horizontally scrollable (three full-width columns inside a 100%-width container), so the property behaves consistently across browsers and the swipe gesture is reliably contained.

### Fallback for `scrollbar-width`

{{ BASELINE_STATUS("scrollbar-width") }}

Hidden scrollbars are a visual enhancement, not the mechanism that makes swipe-to-remove work. If your Baseline target does not include `scrollbar-width`, the row still scrolls, snaps, detects commit, and removes correctly; the unsupported experience may simply show a horizontal scrollbar. If your product requires hidden scrollbars in older WebKit-derived browsers, you can add a narrowly scoped `::-webkit-scrollbar { display: none; }` rule for the swipe track.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/swipe-to-remove/guide.md#L490-L585). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
