### Hover preview

In the wide layout, open the submenu (`submenu.showPopover({ source: trigger })`) on `pointerenter` of the parent `<li>` when `matchMedia("(hover: hover)").matches` and `event.pointerType !== "touch"`, and hide it on `pointerleave` if it is still only hover-previewed (if the user clicks the trigger while previewing, clear the preview flag and call `event.preventDefault()` so the click pins it open instead of toggling it closed). Do not open it when the trigger receives keyboard focus; only `Enter` or `Space` toggles it. Close the open submenu when focus moves to an element outside the submenu's whole list item (`focusout` with a non-null `relatedTarget` outside it), so tabbing or `Shift`+`Tab`bing away closes it.

Position the wide submenu below its trigger with CSS Anchor Positioning (`position-area: block-end span-inline-end` and `position-try-fallbacks: flip-block, flip-inline`). For collision-aware positioning of a plain popover, see `viewport-aware-dropdowns` (via `npx -y modern-web-guidance@latest retrieve "viewport-aware-dropdowns"`). Add a `::before` bridge across any margin gap above the submenu (with `overflow: visible` on the popover) so moving the pointer from the trigger into the submenu does not fire `pointerleave`, and set `height: auto` to prevent Safari from stretching the positioned popover to its placement area:

```css
.site-header.is-wide {
  .dropdown-list[popover] {
    position: absolute;
    position-area: block-end span-inline-end;
    position-try-fallbacks: flip-block, flip-inline;
    inset: auto;
    height: auto;
    inline-size: max-content;
    min-inline-size: 12rem;
    margin-block-start: 0.5rem;
    overflow: visible;
  }

  .dropdown-list::before {
    content: "";
    position: absolute;
    inset-inline: 0;
    inset-block-end: 100%;
    block-size: 0.5rem;
  }

  /* Also hides the list before script sets popover, so an open narrow disclosure cannot widen the measured row */
  .dropdown-list:not(:is(:popover-open, .\:popover-open)) {
    display: none;
  }

  .dropdown-list:is(:popover-open, .\:popover-open) {
    display: grid;
  }
}
```


## Indicating the Current Page

Use `aria-current="page"` to identify the current page. Set it at build time or with JavaScript, and use `[aria-current="page"]` as the CSS styling hook. The visual treatment is a design decision; do not assume a particular pseudo-element, border, or orientation. Do not indicate the current page with color alone (WCAG 1.4.1). Ensure the color of the visual indicator has a contrast of at least `3:1` with the background color.

## Transitions and Accessibility

If the navigation is animated (optional; add it when the abrupt open and close feels out of place), use `@starting-style`, include `display` and `overlay` in `transition`, and declare `transition-behavior: allow-discrete` as a separate property after `transition` (DO NOT put `allow-discrete` in the `transition` shorthand, which makes older browsers ignore the entire `transition` declaration) for both the mobile menu and the wide floating submenu. Animate only `opacity` and `translate`, and respect `prefers-reduced-motion`. For the reusable transition pattern, see `animate-element-entry-exit` (via `npx -y modern-web-guidance@latest retrieve "animate-element-entry-exit"`).

### Optional: Narrow submenu slide-down

Optional. In the narrow layout the submenu is an inline list toggled with `hidden`, which opens instantly by default and is fully functional that way. To slide it open and closed:

- Keep the `[hidden]` list rendered with `display: grid` and `block-size: 0`, then transition `block-size` to `auto` with `interpolate-size: allow-keywords` and `clip-path: inset(-6px)` to clip the slide without cutting off the focus ring (not `overflow: clip`, which clips the ring; `6px` is an example, use at least the ring's outline width plus offset).
- Set `content-visibility: hidden` on the `[hidden]` list, include `content-visibility` in `transition`, and declare `transition-behavior: allow-discrete` separately after `transition` so the content stays rendered until the close finishes.
- Scope it to the collapsed layout and `prefers-reduced-motion: no-preference`; outside it, `[hidden]` must stay `display: none`. In the wide layout the submenu is a popover and must not be clipped.
- For the general technique, see `animate-to-intrinsic-sizes` (via `npx -y modern-web-guidance@latest retrieve "animate-to-intrinsic-sizes"`).

Use logical properties for sizing, spacing, and positioning. Use `dvw` and `dvh` for viewport-relative limits, provide visible `:focus-visible` indicators, and adapt custom borders and current-page indicators under `forced-colors: active`.


## Fallbacks

### Fallbacks & browser support for Popover

Baseline status for Popover: Newly available. It's been Baseline since 2025-01-27.
Supported by: Chrome 116 (Aug 2023), Edge 116 (Aug 2023), Firefox 125 (Apr 2024), Safari 17 (Sep 2023), and Safari iOS 18.3 (Jan 2025).

The Popover API is mostly **progressive enhancement**, but its defining behaviors — top-layer promotion, light-dismiss, and `popovertarget` invocation — have no CSS-only equivalent. Older browsers need a polyfill, or a manual fallback if you would rather not ship one.

**Polyfill:** To support the `popover` attribute in older browsers, conditionally load [`@oddbird/popover-polyfill`](https://github.com/oddbird/popover-polyfill). **MANDATORY:** Feature detect by checking for the `popover` property on `HTMLElement.prototype`, and load the polyfill **only** when native support is missing — do NOT load it unconditionally.

With a bundler or import map:

```js
// MANDATORY: Feature detect 'popover' on HTMLElement.prototype.
if (!Object.hasOwn(HTMLElement.prototype, "popover")) {
  import("@oddbird/popover-polyfill");
}
```

If not using a package manager, import from a CDN, e.g. `"https://unpkg.com/@oddbird/popover-polyfill@latest/dist/popover.min.js"`.

Caveats when using the polyfill:
- Do NOT use the `popover` IDL attribute for any code that may run before the polyfill is fully loaded. It will not be mirrored as an attribute, the popover will not be picked up by the polyfill, and the property will be shadowing the accessor the polyfill adds forever. Use `setAttribute()`/`removeAttribute()` instead.
- **Styling caveat:** The polyfill cannot define the real `:popover-open` pseudo-class, so it applies a `.\:popover-open` class instead. **MANDATORY:** Combine the two with `:is()` or `:where()`, otherwise browsers that lack `:popover-open` discard the entire rule:

```css
[popover]:is(:popover-open, .\:popover-open) {
  display: block;
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/navbar.md#L151-L242). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
