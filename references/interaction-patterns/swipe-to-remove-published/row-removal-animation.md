[Complete example](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/swipe-to-remove.md#L253-L463). Related sections: [Per item observer setup](per-item-observer-setup.md) · [List lifecycle](list-lifecycle.md).
```js
async function removeItem(item, content, direction, entry) {
  // Removing or inerting the row drops focus to <body> if focus is inside it,
  // so move focus to the next row first (or the previous row, or the list
  // heading when the list is now empty). Rows still collapsing are skipped.
  // Keep focus on the same kind of element: if the row itself had focus
  // (some browsers make the track a Tab stop even when it contains buttons),
  // focus the next row, so the larger row focus indicator appears where the
  // user expects it; otherwise focus the next row's first button.
  const list = item.parentElement;
  if (item.contains(document.activeElement)) {
    const rows = [...list.children].filter(
      (row) => row === item || !row.classList.contains('is-removing'),
    );
    const index = rows.indexOf(item);
    const next = rows[index + 1] ?? rows[index - 1];
    const listHeading = document.getElementById(list.getAttribute('aria-labelledby'));
    const firstButton = next?.querySelector('button');
    const target = document.activeElement.matches('.SwipeableList-track')
      ? next?.querySelector('.SwipeableList-track')
      : firstButton;
    (target ?? listHeading).focus();
    // Not every browser lets the track take focus; fall back to the button.
    if (target && document.activeElement !== target) (firstButton ?? listHeading).focus();
  }

  // A row disappearing isn't announced, so say which item was removed in
  // the page's role="status" element from Step 1.
  const label = item.querySelector('.SwipeableList-label').textContent;
  document.querySelector('.SwipeableList-status').textContent = `${label} removed`;

  // Sliding the row off-screen is large movement, so skip it for users who
  // prefer reduced motion and keep a shorter collapse instead.
  // (150ms and 300ms are example durations.)
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const opts = { duration: reduce ? 150 : 300, easing: 'ease', fill: 'forwards' };

  const rect = entry.boundingClientRect;
  // Content's pixel offset from the track's left edge.
  const x = rect.x - entry.rootBounds.x;
  // Pixel distance the content needs to travel to be fully out of view.
  const translate = direction === 'left'
    ? rect.width - x
    : -(x + rect.width);

  // Use a combination of CSS transitions (for declarative styles) and
  // WAAPI animations (for computed values) to remove the element,
  // then await the completion of all of them.
  // Note: the content translate animation is important because the
  // height-collapse animation can otherwise finish before the browser's
  // smooth scroll-snap has scrolled the content fully off-screen.
  item.classList.add('is-removing');
  item.animate([{ height: `${rect.height}px` }, { height: '0px' }], opts);
  if (!reduce) content.animate([{ translate: `${translate}px` }], opts);
  await Promise.allSettled(
    item.getAnimations({ subtree: true }).map((a) => a.finished),
  );

  // Safari has a scroll-latching bug: removing the node while the swipe
  // gesture's momentum is still resolving causes the next item (which
  // slides up into this one's place) to inherit the scroll and
  // immediately scroll itself off-screen. Detect Safari via
  // `GestureEvent` (a Safari-only API) and defer the actual DOM removal
  // until the gesture has fully settled. The 5s delay is conservative;
  // anything longer than the momentum tail is fine. Mark the row inert
  // so it can't be interacted with during the delay.
  if (globalThis.GestureEvent) {
    item.inert = true;
    setTimeout(() => item.remove(), 5000);
  } else {
    item.remove();
  }
}

```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/swipe-to-remove.md#L349-L421). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
