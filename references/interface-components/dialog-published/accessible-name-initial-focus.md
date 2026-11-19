### Accessible name and initial focus

- **DO** name every dialog with `aria-labelledby` pointing at its heading, or `aria-label` when there is no visible title.
- **DO** put `autofocus` on the primary control or first field.
- **DO** put `autofocus` on the safe action (such as Cancel or Keep) in a destructive confirmation.
- **DON'T** write code to return focus on close. The browser returns it to the invoker.

### Opening

- **DO** open declaratively with `command="show-modal"` and `commandfor` on a `<button>`. See `declarative-dialog-popover-control` (via `npx -y modern-web-guidance@latest retrieve "declarative-dialog-popover-control"`).
- **DO** use `dialog.showModal()` when opening from script.

### Closing

- **DO** close with `<form method="dialog">` buttons or `command="close"`.
- **DO** choose `closedby` deliberately: `any` (light dismiss and `Esc`), `closerequest` (`Esc` only, the modal default) or `none` (developer-controlled close only).
- **DO** use `command="request-close"` or `requestClose()` for Cancel buttons that must honor unsaved-changes logic. They fire `cancel` first and ignore `closedby`.
- **DO** treat `closedby` as progressive enhancement. `Esc` and the mobile back gesture already close modals without it.

### Hooking into close

- **DO** read `dialog.returnValue` in a `close` listener to learn which button was used, then reset it with `dialog.returnValue = ''`. `Esc` and other close requests set no value, and browsers differ on whether they clear the previous one, so without the reset a stale value can leak. Treat `''` as "dismissed without choosing".
- **DO** use `cancel` to intercept `Esc` and `request-close`, but do not rely on `preventDefault()` for repeated `Esc` presses without user activation.
- **DO** use `closedby="none"` with an explicit confirmation step for dirty forms.
- **DO** tell the user why the dialog stayed open when `cancel` is prevented: show a visible message and reference it with `aria-describedby` from the control that receives focus (such as Discard), so a screen reader reads it when focus moves. Without it, focus moving to a new button announces only that button's name.
- **DON'T** let the confirmation move controls under the pointer. Reserve the message's space (hide it with `visibility`, not `display` or `hidden`) and add the destructive button where existing buttons do not move (for example first in a right-aligned row), so a second click at the same spot cannot discard the user's changes.

### Non-modal dialogs

- **DO** use `<dialog popover>` (`auto` or `manual`) for a top-layer panel, and `dialog.show()` when you do not want the top layer.
- **DO** include a visible close button in every non-modal dialog.

### Backdrop and styling

- **DO** style `::backdrop` and use `dialog:modal` to target modal-only styles.
- **DO** leave animation to `animate-to-from-top-layer` (via `npx -y modern-web-guidance@latest retrieve "animate-to-from-top-layer"`), dragging to `drag` (via `npx -y modern-web-guidance@latest retrieve "drag"`), and reparenting to `persistent-top-layer-ui` (via `npx -y modern-web-guidance@latest retrieve "persistent-top-layer-ui"`).
- **DON'T** set `display` on `dialog` unconditionally. It overrides the closed state. Scope it with `dialog[open]`.

### Accessibility

- **DON'T** add `role="dialog"`, `aria-modal`, a manual focus trap or `inert` toggling to a native modal.
- **DO** use a native `<button>` with an accessible name for close controls.
- **DO** use one consistent heading level for dialog titles.

## Fallback strategies

### `closedby` (`dialog-closedby`)

Browser support for `<dialog closedby>`: Limited availability.
Supported by: Chrome 134 (Mar 2025), Edge 134 (Mar 2025), and Firefox 141 (Jul 2025).
Unsupported in: Safari.

Without `closedby`, a modal still closes with `Esc` and the back gesture; only click-outside is lost, so this is graceful degradation. `closedby="none"` is ignored the same way: `Esc` fires `cancel` and then closes the dialog. Keep the unsaved-changes guard in a `cancel` handler, not in `closedby="none"` alone, so it also protects where `closedby` is missing. If your Baseline target requires light dismiss, add this where `closedby` is missing:

```js
if (!('closedBy' in HTMLDialogElement.prototype)) {
  // Test the pointer position, not event.target: the <dialog> is also the target for its own
  // padding and the gaps between its children, so a target check would close on those clicks
  const outside = (e, dialog) => {
    const r = dialog.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  };
  for (const dialog of document.querySelectorAll('dialog[closedby="any"]')) {
    let pressedOutside = false;
    dialog.addEventListener('pointerdown', (e) => { pressedOutside = outside(e, dialog); });
    // Require the press and the release outside, so a text-selection drag that ends on the backdrop does not dismiss
    dialog.addEventListener('pointerup', (e) => { if (pressedOutside && outside(e, dialog)) dialog.close(); });
  }
}
```

### `overscroll-behavior`

Browser support for overscroll-behavior: Limited availability.
Supported by: Chrome 144 (Jan 2026), Edge 144 (Jan 2026), and Firefox 150 (Apr 2026).
Unsupported in: Safari.

Treat scroll containment as progressive enhancement. Do not feature-detect it: `@supports` reports the property as supported even where non-scrollable containers ignore it. Where it is not enforced, the dialog still contains scroll whenever its own content overflows, and `showModal()` still makes the page inert. Do not fall back to `overflow: hidden` or `position: fixed` on `html` or `body`, which removes the root scrollbar and shifts the layout.

### Invoker Commands (`command` / `commandfor`)

Baseline status for Invoker commands: Newly available. It's been Baseline since 2025-12-12.
Supported by: Chrome 135 (Apr 2025), Edge 135 (Apr 2025), Firefox 144 (Oct 2025), and Safari 26.2 (Dec 2025).

If your Baseline target does not include Invoker Commands, keep the same markup and conditionally load the polyfill (the same experience, as progressive enhancement). Detect on the interface and never load it unconditionally:

```js
// MANDATORY: feature detect on HTMLButtonElement.prototype and load only when native support is missing
if (!('commandForElement' in HTMLButtonElement.prototype)) {
  import('invokers-polyfill'); // npm install invokers-polyfill
}
```

Only Rules 2 and 3 use Popover.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/dialog.md#L95-L189). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
