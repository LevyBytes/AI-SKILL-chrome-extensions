Related section: [Polyfilling Invoker Commands](polyfilling-invoker-commands.md).
```yaml
---
name: declarative-dialog-popover-control
description: Toggle the visibility of a dialog or popover from a button without writing JavaScript.
web-feature-ids:
  - invoker-commands
  - popover
  - dialog
---
```

# Declarative Dialog and Popover Control

Use the Invoker Commands API to toggle the visibility of `<dialog>` and `[popover]` elements directly from HTML buttons, eliminating the need for custom JavaScript event listeners.

By applying the `commandfor` (target ID) and `command` (action) attributes to a `<button>`, the browser automatically handles open/close state changes, focus management, and accessibility bindings (such as `aria-expanded`). This declarative approach is recommended because it removes brittle boilerplate code, ensures interactions are functional immediately upon HTML parsing, and guarantees a robust, natively accessible user experience.

## Implementing Declarative Popovers

Popovers can be toggled open and closed using a single button.

```html
<!-- MANDATORY: The commandfor attribute links the invoker to the ID of the target element so the browser knows what to control. -->
<!-- MANDATORY: The command attribute specifies the action to perform. Use 'toggle-popover' to handle both open and close states automatically. -->
<button commandfor="my-popover" command="toggle-popover">
  Toggle Popover
</button>

<!-- MANDATORY: The target element must have the popover attribute to be controlled as a popover. -->
<div id="my-popover" popover>
  <p>Popover content goes here.</p>
</div>
```

If you need to control opening and closing with separate buttons, you can use the `show-popover` and `hide-popover` commands.

**IMPORTANT:** Do NOT combine `popovertarget` and `commandfor` on the same `<button>`, for the same popover. This will double-toggle it, breaking functionality.

```html
<!-- MANDATORY: Use 'show-popover' to explicitly open the popover. It will not close the popover if clicked again. -->
<button commandfor="my-explicit-popover" command="show-popover">
  Show Popover
</button>

<div id="my-explicit-popover" popover="manual">
  <p>This popover is explicitly opened and closed by separate buttons.</p>

  <!-- MANDATORY: Use 'hide-popover' to explicitly close the targeted popover. -->
  <button commandfor="my-explicit-popover" command="hide-popover">
    Hide Popover
  </button>
</div>
```

Hiding a popover, using a button inside the popover itself, will result in a loss of focus as the button will be hidden and won't retain focus. In this situation, provide additional scripting to return focus to the trigger/show control, so that people can continue to navigate from where they were previously.

## Implementing Declarative Modal Dialogs

Unlike popovers, modal dialogs typically use separate buttons for opening and closing. Use the `show-modal` command specifically when you need to open a dialog as a modal.

```html
<!-- MANDATORY: Use command="show-modal" to trigger the dialog as a modal, trapping focus and preventing interaction with the rest of the page. -->
<!-- MANDATORY: The commandfor attribute connects this button to the dialog ID. -->
<button commandfor="confirm-dialog" command="show-modal">
  Open Confirmation
</button>

<dialog id="confirm-dialog">
  <p>Are you sure you want to proceed?</p>

  <!-- MANDATORY: Use command="close" to dismiss the dialog safely. -->
  <!-- type="button" keeps this working if the dialog content is later wrapped in a <form>. -->
  <button type="button" commandfor="confirm-dialog" command="close">
    Cancel
  </button>
</dialog>
```

MANDATORY: Any button with `commandfor` and `command` that is inside a `<form>` (including the common `<form method="dialog">` wrapper) MUST set an explicit `type`: `type="button"` to run the command. Do not put a `command="close"` button inside `<form method="dialog">`— pick one strategy. A button with `type="submit"` will submit the form, and not also run the command. A command button with no `type` inside a `<form>` or with a `form` attribute does nothing, so older browsers which don't support commands don't submit the form by accident.

{# The HTML Standard's `button` activation behavior returns early for a button in the Auto type state with `command`/`commandfor` and a form owner. Lifting this is tracked in https://github.com/whatwg/html/issues/10832. See https://github.com/GoogleChrome/modern-web-guidance-src/issues/3091. #}

## Fallback strategies

{{ BASELINE_STATUS("invoker-commands") }}

Because Invoker Commands and Popovers are not yet universally supported, you MUST use polyfills as fallbacks for older browsers.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/declarative-dialog-popover-control/guide.md#L1-L86). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
