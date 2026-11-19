## Wide Layout: Inline Navigation

When the row fits, hide the collapsed-layout trigger and reset the popover presentation so the same list participates in the header as an inline navigation.

```css
.site-header.is-wide {
  .menu-button {
    display: none;
  }

  .site-menu {
    position: static;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    inline-size: auto;
    max-inline-size: none;
    block-size: auto;
    max-block-size: none;
    overflow: visible;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    box-shadow: none;
  }

  .site-menu::backdrop {
    display: none;
  }
}
```

CSS changes the presentation, but JavaScript decides which layout applies and must also synchronize the `popover` attribute with it. Measure the inline row: show it inline, compare `scrollWidth` with `clientWidth` on the header's inner row, then toggle `is-wide`. Add a temporary `is-measuring` class that sets `transition: none` on descendants for the measurement and remove it in `requestAnimationFrame`, otherwise the menu animates from its inline styles on every resize and flickers. Keep the navigation as a popover only in the collapsed layout; remove the attribute in the inline layout. Removing it closes an open popover, so note whether the menu was open and call `showPopover()` again if the layout is still collapsed; otherwise a resize closes the open menu. Run one shared function from `ResizeObserver`s on the header and the navigation list, so font loading and text changes are caught without special cases. Remeasure while inline on every notification, but while collapsed only when the header's width has grown. Switching to inline just to measure on every shrink makes the layout thrash. The tradeoff is that a collapsed menu that gets smaller by itself (for example a shorter translation) stays collapsed until the header grows. Do not infer the layout from a hidden trigger.


## Nested Site Navigation

Use a `<button>` with `aria-expanded` and `aria-controls` as the trigger for nested site navigation, followed immediately by the submenu list. DO NOT use `<details>` and `<summary>`: `<summary>` should map to a `button` role, but has not been consistently implemented in browsers, so screen readers announce it inconsistently (for example as "summary" or "disclosure triangle").

One list must be an inline disclosure when narrow and a floating popover when wide. A top-layer popover cannot render in flow, so `popover` is set only in the wide layout, where `popovertarget` opens it natively. Leave `popover` off the submenu in the markup: without script it stays a nested list inside the menu, matching the narrow layout. In the narrow layout a small click handler toggles `hidden` and `aria-expanded`. Hide the narrow submenu from script, not in the markup.

Synchronize the layout state from the same function that handles the navigation list. When inline, set `popover="auto"` on the submenu, clear `hidden`, and let the native `toggle` event drive `aria-expanded`. When narrow, remove `popover`, set `hidden` from script, and let a click handler toggle `hidden` and `aria-expanded`:

```js
const wide = inner.scrollWidth <= inner.clientWidth; // measured with is-wide set
if (wide) submenu.setAttribute("popover", "auto");
else submenu.removeAttribute("popover");
submenu.hidden = !wide;
trigger.setAttribute("aria-expanded", "false");
```

> [!NOTE]
> Use `setAttribute()`/`removeAttribute()`, NOT the `popover` JS property, as it can cause race conditions if popover is used through a polyfill.

Do not add document-level click-outside, Escape or focus-restoration handlers. The native popover provides those interactions in the wide layout, and the narrow disclosure needs only the click handler. The declarative `popovertarget` makes the button the submenu's implicit anchor, so wide-layout positioning can use `position-area` without a separate `anchor-name` or `position-anchor` declaration.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/navbar.md#L94-L150). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
