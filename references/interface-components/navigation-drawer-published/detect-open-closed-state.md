### 4. Detect open and closed state

Use an `IntersectionObserver` on the sheet — not the scroll position — as the source of truth for the drawer's state. The observer fires regardless of how the sheet moved (user swipe, programmatic scroll, snap settle), so all dismissal paths converge in the same callback.

Because the drawer is a modal `<dialog>`, the browser makes the rest of the page inert while it is open and moves focus back to the trigger button when it closes, so these callbacks only need to close the dialog and keep `aria-expanded` in sync.

```js
function onDrawerOpened() {
  openBtn.setAttribute('aria-expanded', 'true');
}

function onDrawerClosed() {
  // Close the dialog only after the close animation completes,
  // so the slide-out is visible to the user.
  drawer.close();
  openBtn.setAttribute('aria-expanded', 'false');
}

// Treat "any pixel of the sheet visible inside the dialog" as
// "open enough to count as not closed". This threshold is intentionally
// tiny so the closed callback only fires once the sheet is truly gone.
const visibleThreshold = 1 / window.innerWidth;

const observer = new IntersectionObserver(
  (entries) => {
    // During programmatic scrolling the observer can deliver multiple
    // entries in one batch. Only the most recent describes the
    // current state; earlier entries are intermediate positions.
    const entry = entries.at(-1);
    if (entry.intersectionRatio < visibleThreshold) onDrawerClosed();
    if (entry.intersectionRatio === 1) onDrawerOpened();
  },
  // root: drawer makes the dialog element the intersection root,
  // so the ratio reflects the sheet's visibility within the dialog
  // (i.e. how much of it has been swiped on-screen).
  {root: drawer, threshold: [visibleThreshold, 1]},
);
observer.observe(sheet);
```

### 5. Wire up the trigger and dismissal handlers

```js
// Open trigger.
openBtn.addEventListener('click', openDrawer);

// Close trigger.
closeBtn.addEventListener('click', closeDrawer);

// Light-dismiss: a tap on the dimmed area (anywhere inside the
// dialog but outside the sheet) closes the drawer. Do not use
// closedby="any": the dialog fills the viewport, so taps land on the
// dialog rather than its ::backdrop, and it would close without the
// slide-out animation.
drawer.addEventListener('click', (event) => {
  if (!sheet.contains(event.target)) closeDrawer();
});

// Escape key. A modal dialog fires `cancel` on Escape; prevent the
// instant close and slide the drawer out instead.
// NOTE: Browsers may make `cancel` non-cancelable on repeated Escape
// presses without user activation in between, closing the dialog instantly.
drawer.addEventListener('cancel', (event) => {
  if (event.cancelable) {
    event.preventDefault();
    closeDrawer();
  }
});
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/navigation-drawer.md#L242-L311). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
