# Dialog

## Overview

Use the native `<dialog>` element for modal and non-modal dialogs. It provides the accessibility semantics, focus handling, top-layer rendering and `Esc` handling that custom overlays have to rebuild by hand.

## Choose the overlay type

Pick the first rule that matches. If unsure, use Rule 1.

### Rule 1: The overlay interrupts the user and blocks the page (default)

Use for confirmations, forms, sign-in, destructive actions, and any "modal", "dialog", "lightbox" or "popup" request that does not say otherwise.

Use `<dialog>` opened as a modal, declaratively with `command="show-modal"` (see `declarative-dialog-popover-control` (via `npx -y modern-web-guidance@latest retrieve "declarative-dialog-popover-control"`)) or from script with `showModal()`.

```html
<button type="button" command="show-modal" commandfor="confirm">Delete</button>

<!-- MANDATORY: no role="dialog" or aria-modal; the native modal already provides them -->
<dialog id="confirm" aria-labelledby="confirm-title">
  <h2 id="confirm-title">Delete this item?</h2>
  <form method="dialog">
    <button value="cancel" autofocus>Cancel</button>
    <button value="delete">Delete</button>
  </form>
</dialog>
```

The browser provides: inert page, focus containment, top layer, `::backdrop`, `Esc` and back-gesture dismissal, and focus return to the invoker.

- **DON'T** add `role="dialog"`, `aria-modal`, a focus trap, `inert` toggling or an `Esc` handler.
- **DON'T** open it with `show()` or the `open` attribute.
- **DO** stop the page scrolling behind it with the CSS below. See `prevent-page-scroll-under-modal-dialog` (via `npx -y modern-web-guidance@latest retrieve "prevent-page-scroll-under-modal-dialog"`) for the details.
- **DON'T** lock scrolling with `overflow: hidden` or `position: fixed` on `html` or `body`.

```css
/* MANDATORY (both rules): without them, scrolling over the backdrop or inside the dialog scrolls the page behind it */
dialog:modal {
  overscroll-behavior: contain; /* stops scroll gestures in the dialog chaining to the page */
}
dialog::backdrop {
  overflow: hidden; /* ::backdrop is not a scroll container by default, so it would ignore overscroll-behavior */
  overscroll-behavior: contain;
}
```

Not for menus or tooltips: see Rule 3.

### Rule 2: The user keeps working in the page while the panel is open

Use for find bars, inspectors, palettes and compose panes that are still dialogs semantically.

Use `<dialog popover>` for a top-layer panel with popover dismissal (`auto` light-dismisses, `manual` does not). Use `dialog.show()` only when the panel must not be in the top layer.

```html
<button type="button" popovertarget="find">Find</button>
<dialog id="find" popover="manual" aria-labelledby="find-title">
  <h2 id="find-title">Find</h2>
  <input type="search" aria-label="Search">
  <button type="button" popovertarget="find" popovertargetaction="hide">Close</button>
</dialog>
```

The page stays interactive and is not made inert.

- **DO** include a visible close button.
- **DON'T** use `showModal()`, which blocks the page.

Not for blocking confirmations: see Rule 1.

### Rule 3: The overlay is not a dialog

Use for menus, dropdowns, tooltips, hovercards and toasts.

Use a semantic element with the `popover` attribute, not `<dialog>`.

```html
<button type="button" popovertarget="menu">Actions</button>
<ul id="menu" popover>
  <li><a href="/rename">Rename</a></li>
</ul>
```

## Choose how it can be dismissed

The default depends on how the dialog is opened. If `closedby` is absent or invalid, `showModal()` behaves as `closerequest` and any other way of opening behaves as `none`.

- **Esc and back gesture only (modal default):** set nothing, or `closedby="closerequest"`.
- **Also click outside to close:** use `closedby="any"`.
- **Only the developer closes it (for example a form with unsaved changes):** use `closedby="none"` and add a confirmation path. See Closing below.

## Guidelines


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/dialog.md#L1-L94). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
