[Complete example](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/swipe-to-remove/guide.md#L268-L478). Related sections: [Step 3: Add the action icons to the list item](add-action-icons-list-item.md) · [Per item observer setup](per-item-observer-setup.md).
### Step 4: Detect the commit gesture with `IntersectionObserver`

Use `IntersectionObserver` rooted at the track, observing the content. As the user swipes, the content's intersection ratio with the track drops; we use **two thresholds**:

- `activateThreshold`: a high ratio (e.g., 0.8). When the visible portion of the content drops below this, the user is past the visual activate point. Toggle the icon-pop affordance.
- `commitThreshold`: a low ratio (e.g., 0.2). When the visible portion drops below this, the user has committed. Start the remove animation **immediately**, without waiting for the snap gesture to fully settle. The collapsing row blends into the user's continuing swipe momentum, which feels more responsive than waiting for the snap to land before reacting.

Three more concerns are handled here:

- **Lazy per-item setup**: a single outer `IntersectionObserver` rooted at the viewport drives setup and the start/stop of the inner swipe observers. Items only get wired up the first time they scroll into view, and items that scroll off-screen have their swipe observer paused. This keeps the active observer count bounded and avoids reading layout-dependent values (like `clientWidth`) before the item has been rendered.
- **Dynamic items**: real lists grow over time (initial render, infinite scroll, server push). A `MutationObserver` on the `<ul>` registers any newly added items with the outer observer.
- **Action buttons**: a click (or the Enter key) on an item's action button runs the same `commit` function as the swipe it stands in for, so both paths share the focus move, the announcement and the removal animation. The action color and icon are revealed by scrolling the track during a swipe, so they don't appear when a button is used.

```js
// Per-item handles. Populated when an item is first lazily wired up; read by
// the outer viewport observer to start/stop the inner observer as items enter
// and leave the viewport.
const swipeObservers = new WeakMap();

// Outer observer: drives the entire swipe lifecycle off viewport visibility.
// On first entry, lazily wires the item up (`setupItem` reads layout-dependent
// values like `clientWidth`, which return 0 until the item is rendered). After
// setup, starts the inner observer. On exit, stops the inner observer so
// offscreen items don't track scroll positions.
const viewportObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    const item = entry.target;
    if (entry.isIntersecting) {
      const handle = swipeObservers.get(item) ?? setupItem(item);
      handle.observer.observe(handle.content);
    } else {
      const handle = swipeObservers.get(item);
      if (handle) handle.observer.unobserve(handle.content);
    }
  }
});

```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/swipe-to-remove/guide.md#L255-L291). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
