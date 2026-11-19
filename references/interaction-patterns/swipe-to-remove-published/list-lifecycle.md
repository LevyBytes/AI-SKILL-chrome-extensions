[Complete example](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/swipe-to-remove.md#L253-L463). Related sections: [Row removal animation](row-removal-animation.md) · [Different actions per swipe direction](different-actions-per-swipe-direction.md).
```js
function setupList(list) {
  // Observe items already in the list.
  for (const item of list.children) {
    if (item.matches('.SwipeableList-item')) {
      viewportObserver.observe(item);
    }
  }

  // Pick up items added later (initial render after data loads, infinite
  // scroll, server push). Removals don't need MutationObserver handling —
  // `commit()` above already unobserves the item before removing it from the
  // DOM.
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE &&
            node.matches('.SwipeableList-item')) {
          viewportObserver.observe(node);
        }
      }
    }
  }).observe(list, { childList: true });

  // Delegate from the list so items added later work too. A keyboard user can
  // reach a button before its row has scrolled into view, so set the item up
  // on demand.
  list.addEventListener('click', (event) => {
    const button = event.target.closest('.SwipeableList-action');
    const item = button?.closest('.SwipeableList-item');
    if (!item) return;
    const handle = swipeObservers.get(item) ?? setupItem(item);
    // Commit in the direction of the swipe this button stands in for, passing
    // the same measurements an IntersectionObserver entry carries.
    handle.commit(button.dataset.direction, {
      boundingClientRect: handle.content.getBoundingClientRect(),
      rootBounds: handle.track.getBoundingClientRect(),
    });
  });
}

document.querySelectorAll('.SwipeableList').forEach(setupList);
```

### Step 5: Use the action and label that fits your use case

For variants other than removal, only the visuals and the body of the commit handler change:

- **Archive**: green/blue background, archive icon, move the item to an archive list rather than removing it.
- **Mark as read**: subdued background, checkmark icon, update item state and re-render (or just remove a `.unread` class).
- **Snooze**: blue background, clock icon, hide until a chosen time.

The scroll/snap/observation mechanics are unchanged.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/swipe-to-remove.md#L422-L474). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
