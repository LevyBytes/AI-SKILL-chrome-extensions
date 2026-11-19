### Fallback for `overscroll-behavior`

Browser support for overscroll-behavior: Limited availability.
Supported by: Chrome 144 (Jan 2026), Edge 144 (Jan 2026), and Firefox 150 (Apr 2026).
Unsupported in: Safari.

No fallback is needed for this use case. Although `overscroll-behavior` has an interop issue that manifests on containers without scrollable overflow, the track here is always horizontally scrollable (three full-width columns inside a 100%-width container), so the property behaves consistently across browsers and the swipe gesture is reliably contained.

### Fallback for `scrollbar-width`

Baseline status for scrollbar-width: Newly available. It's been Baseline since 2024-12-11.
Supported by: Chrome 121 (Jan 2024), Edge 121 (Jan 2024), Firefox 64 (Dec 2018), and Safari 18.2 (Dec 2024).

Hidden scrollbars are a visual enhancement, not the mechanism that makes swipe-to-remove work. If your Baseline target does not include `scrollbar-width`, the row still scrolls, snaps, detects commit, and removes correctly; the unsupported experience may simply show a horizontal scrollbar. If your product requires hidden scrollbars in older WebKit-derived browsers, you can add a narrowly scoped `::-webkit-scrollbar { display: none; }` rule for the swipe track.

### Fallback for `scroll-initial-target`

Browser support for scroll-initial-target: Limited availability.
Supported by: Chrome 133 (Feb 2025) and Edge 133 (Feb 2025).
Unsupported in: Firefox and Safari.

If your Baseline target does not include `scroll-initial-target`, scroll the track to the content programmatically inside `setupItem`. Detect with `CSS.supports`:

```js
// Hoist the feature detect so the conditional `ResizeObserver` below can be
// skipped entirely when the property is supported.
const needsScrollWorkaround = !CSS.supports('scroll-initial-target', 'nearest');

function setupItem(item) {
  // ...existing setup from Step 4...

  if (needsScrollWorkaround) {
    track.scrollLeft = track.clientWidth;
  }

  // ...attach the inner IntersectionObserver, etc.
}
```

**Call ordering matters.** The programmatic scroll MUST run:

1. **AFTER** `.is-initialized` is added to the list item (the class is what turns the track into a scroll container; setting `scrollLeft` on a non-scrollable element is a no-op).
2. **BEFORE** the inner `IntersectionObserver` from Step 4 is attached. Otherwise the initial programmatic scroll past the left spacer will be observed as a "swipe" and immediately fire the commit handler.

Driving setup from the outer viewport observer (Step 4) is what makes this reliable: `setupItem` runs after the item is rendered, so `track.clientWidth` returns a real value rather than `0`.

Some browsers (notably Safari) also reset the snap-container scroll position whenever the track resizes (URL-bar show/hide, viewport resize, container queries, etc.). Use a `ResizeObserver` on each track to re-apply the scroll. Gate it behind the same `CSS.supports` check — when `scroll-initial-target` is supported, the browser handles resize-time scroll restoration itself.

```js
const trackResizeObserver = needsScrollWorkaround
  ? new ResizeObserver((entries) => {
      for (const entry of entries) {
        entry.target.scrollLeft = entry.target.clientWidth;
      }
    })
  : null;

function setupItem(item) {
  // ...existing setup...

  if (needsScrollWorkaround) {
    track.scrollLeft = track.clientWidth;
    trackResizeObserver.observe(track);
  }

  // ...attach the inner IntersectionObserver, etc.
}
```

Unobserve the track before the row's height animation runs in `removeItem`, otherwise the height change re-triggers the resize callback during removal. Add this alongside the existing `viewportObserver.unobserve(item)` in the `commit` function (Step 4):

```js
function commit(direction, entry) {
  if (item.classList.contains('is-removing')) return;
  removeItem(item, content, direction, entry);
  viewportObserver.unobserve(item);
  if (needsScrollWorkaround) trackResizeObserver.unobserve(track);
  observer.disconnect();
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/swipe-to-remove.md#L564-L643). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
