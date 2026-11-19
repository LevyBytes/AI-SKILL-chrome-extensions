### Fallback for `scroll-initial-target`

{{ BASELINE_STATUS("scroll-initial-target") }}

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

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/swipe-to-remove/guide.md#L586-L648). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
