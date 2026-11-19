## Implementation for a drawer that also acts as a sidebar

Use this implementation when the same element also becomes a regular, always-visible sidebar under certain conditions (see [Choose the drawer element](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/navigation-drawer/guide.md#choose-the-drawer-element)). Toggle `role` from the same media query that switches the layout (e.g. with `matchMedia()`): remove it while the element acts as a sidebar, and restore `role="dialog"` when it becomes a drawer again. This guide does not cover the sidebar layout itself.

Follow the [`<dialog>` implementation](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/navigation-drawer/guide.md#implementation-with-dialog), with these changes:

- **Markup**: `<div class="Drawer" id="drawer" popover="manual" role="dialog" aria-label="Navigation drawer">`. `popover="manual"` is REQUIRED; do not use `popover="auto"` or `"hint"`, as their built-in light-dismiss would also fire mid-swipe.
- **Open and close**: call `showPopover()` instead of `showModal()` and `hidePopover()` instead of `close()`. The rest of the CSS and JS is unchanged.
- **Modality**: a popover is not modal, so the code must do what a modal dialog does natively:
  - Mark the rest of the page `inert` while the drawer is open.
  - Apply `aria-modal="true"` while the drawer is open, and remove it when it closes.
  - Move focus back to the trigger button after the drawer closes.
  - Handle Escape with a `keydown` listener on `document`, since popovers do not fire `cancel`.

```js
const main = document.querySelector('main');

function openDrawer() {
  drawer.showPopover();
  // Mark everything outside the drawer inert immediately on open (include
  // sibling <header>/<footer> landmarks if they live outside <main>).
  main.inert = true;
  drawer.setAttribute('aria-modal', 'true');
  scroller.scrollTo({left: 0, behavior: 'auto'});
}

function onDrawerClosed() {
  // The observer also reports "closed" on page load; ignore it unless open.
  if (!drawer.hasAttribute('aria-modal')) return;
  drawer.hidePopover();
  main.inert = false;
  drawer.removeAttribute('aria-modal');
  openBtn.setAttribute('aria-expanded', 'false');
  openBtn.focus();
}

// Escape key. Listen on document because focus may be inside the
// drawer when the user presses Escape.
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeDrawer();
});
```

## Fallback strategies

{{ BASELINE_STATUS("scroll-snap") }}

{{ BASELINE_STATUS("intersection-observer") }}

The scroll-driven animation that fades the backdrop and `scroll-initial-target` are progressive enhancements with simple fallbacks that can be easily implemented if wide browser support is required.

### Backdrop fade fallback (no `animation-timeline` support):

{{ BASELINE_STATUS("scroll-driven-animations") }}

Detect with `CSS.supports('animation-timeline: scroll()')` and write `--drawer-backdrop` from a `scroll` event listener if not supported. The CSS `@supports` block in step 2 ensures the keyframes never apply in unsupported browsers, so the JavaScript value is the only writer.

```js
if (!CSS.supports('animation-timeline: scroll()')) {
  scroller.addEventListener('scroll', () => {
    // Same mapping as the @keyframes: 0 scroll = 1 (open),
    // sheet-width scroll = 0 (closed).
    const ratio = 1 - scroller.scrollLeft / sheet.offsetWidth;
    drawer.style.setProperty('--drawer-backdrop', ratio);
  });
}
```

### Initial scroll position fallback (no `scroll-initial-target` support):

{{ BASELINE_STATUS("scroll-initial-target") }}

Detect with `CSS.supports('scroll-initial-target', 'nearest')` and inside `openDrawer()`, jump-scroll the scroller to the closed position immediately after showing the drawer (`showModal()`, or `showPopover()` when it [also acts as a sidebar](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/navigation-drawer/guide.md#implementation-for-a-drawer-that-also-acts-as-a-sidebar)). Without this, the drawer would appear instantly in the open position with no slide-in animation.

```js
async function openDrawer() {
  drawer.showModal(); // sidebar variant: showPopover(), main.inert = true, and aria-modal="true"

  if (!CSS.supports('scroll-initial-target', 'nearest')) {
    // Jump-scroll to the closed stop so the scroll below
    // animates the drawer in from off-screen.
    scroller.scrollTo({left: scroller.offsetWidth, behavior: 'instant'});
    // Wait two animation frames for the jump-scroll to commit.
    // A single rAF is not enough — the second `scrollTo` would
    // cancel the first before the browser has a chance to apply it.
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r))
    );
  }

  scroller.scrollTo({left: 0, behavior: 'auto'});
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/navigation-drawer/guide.md#L326-L419). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
