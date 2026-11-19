### Initial scroll position fallback (no `scroll-initial-target` support):

Browser support for scroll-initial-target: Limited availability.
Supported by: Chrome 133 (Feb 2025) and Edge 133 (Feb 2025).
Unsupported in: Firefox and Safari.

Detect with `CSS.supports('scroll-initial-target', 'nearest')` and inside `openDrawer()`, jump-scroll the scroller to the closed position immediately after showing the drawer (`showModal()`, or `showPopover()` when it [also acts as a sidebar](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/navigation-drawer.md#implementation-for-a-drawer-that-also-acts-as-a-sidebar)). Without this, the drawer would appear instantly in the open position with no slide-in animation.

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

### `@property` fallback (no registered custom properties):

Baseline status for Registered custom properties: Newly available. It's been Baseline since 2024-07-09.
Supported by: Chrome 85 (Aug 2020), Edge 85 (Aug 2020), Firefox 128 (Jul 2024), and Safari 16.4 (Mar 2023).

`@property` is only needed because the scroll-driven animation interpolates `--drawer-backdrop` between keyframes — without registration, the property would be treated as a string and would jump between 0 and 1 with no fade. If the scroll-driven animation fallback above is in place, that JavaScript writes a fresh numeric string to `--drawer-backdrop` on every scroll frame and never interpolates, so no separate `@property` fallback is needed since all browsers that support scroll-driven animations also support `@property`.


### Popover API fallback (sidebar variant only):

Baseline status for the api.HTMLElement.showPopover capability: Widely available. It's been Baseline since 2024-04-16.
Supported by: Chrome 114 (May 2023), Edge 114 (Jun 2023), Firefox 125 (Apr 2024), and Safari 17 (Sep 2023).

Baseline status for inert: Widely available. It's been Baseline since 2023-04-11.
Supported by: Chrome 102 (May 2022), Edge 102 (May 2022), Firefox 112 (Apr 2023), and Safari 15.5 (May 2022).

When the drawer [also acts as a sidebar](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/navigation-drawer.md#implementation-for-a-drawer-that-also-acts-as-a-sidebar), it uses `popover="manual"` and implements dismissal entirely from JavaScript, so it does not depend on light-dismiss, the `popovertarget` attribute, or top-layer-managed Escape handling. Aside from top-layer promotion (`showPopover()`) and `::backdrop`, the only popover behavior it relies on is processing `autofocus` when shown.

If wider browser support is needed, do not branch on feature detection — simply do not use popover at all. Drop the `popover="manual"` attribute, replace top-layer promotion with `position: fixed` and a high `z-index`, replace `::backdrop` with a sibling element styled identically (using the same `--drawer-backdrop` custom property), toggle visibility from a class instead of `showPopover()`/`hidePopover()`, and call `closeBtn.focus({preventScroll: true})` in `openDrawer()` after making the drawer visible (`preventScroll` avoids scrolling the container early). The rest of the component (scroll snap, the scroll-driven backdrop animation, the `IntersectionObserver`, and the dismissal handlers) is unchanged.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/navigation-drawer.md#L383-L429). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
