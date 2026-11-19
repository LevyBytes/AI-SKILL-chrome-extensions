## Implementation for a drawer that also acts as a sidebar

Use this implementation when the same element also becomes a regular, always-visible sidebar under certain conditions (see [Choose the drawer element](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/navigation-drawer.md#choose-the-drawer-element)). Toggle `role` from the same media query that switches the layout (e.g. with `matchMedia()`): remove it while the element acts as a sidebar, and restore `role="dialog"` when it becomes a drawer again. This guide does not cover the sidebar layout itself.

Follow the [`<dialog>` implementation](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/navigation-drawer.md#implementation-with-dialog), with these changes:

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

Baseline status for Scroll snap: Widely available. It's been Baseline since 2020-01-15.
Supported by: Chrome 69 (Sep 2018), Edge 79 (Jan 2020), Firefox 68 (Jul 2019), and Safari 11 (Sep 2017).

Baseline status for Intersection observer: Widely available. It's been Baseline since 2019-03-25.
Supported by: Chrome 58 (Apr 2017), Edge 16 (Oct 2017), Firefox 55 (Aug 2017), Safari 12.1 (Mar 2019), and Safari iOS 12.2 (Mar 2019).

The scroll-driven animation that fades the backdrop and `scroll-initial-target` are progressive enhancements with simple fallbacks that can be easily implemented if wide browser support is required.

### Backdrop fade fallback (no `animation-timeline` support):

Baseline status for Scroll-driven animations: Newly available. It's been Baseline since 2026-10-27.
Supported by: Chrome 115 (Jul 2023), Edge 115 (Jul 2023), Firefox 159 (Oct 2026), and Safari 26 (Sep 2025).

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


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/navigation-drawer.md#L312-L382). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
