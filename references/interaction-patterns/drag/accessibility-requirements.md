Related section: [Drag](overview.md).
## Accessibility requirements

The drag handle that is exposed to assistive technologies must be a dedicated button, rather than just scripting the header of a dialog to be draggable. This will ensure the button is exposed to screen reader users with an appropriate role and accessible name. For example, using a native button element:

```html
<button type="button" aria-label="Notes panel handle. Use arrow keys to move.">
  <!-- handle icon -->
</button>
```

Ensure the draggable element can also be moved or operated using a single pointer without dragging (for example, clicks or taps). What the UI for this looks like depends on the use case. A few examples:
- Kanban boards: a "move to column" menu or buttons
- Maps: directional pan buttons
- Sliders: clicking on the track, and sometimes adjusting the value via a linked `<input>`
- Floating panels and dialogs: a grid in the background where clicking on a cell in the grid moves the element to the new position or their drag handle may be a menu button, with menu items to reposition the element ("Dock left", "Move left", "Dock top", "Move up", "Dock right", "Move right", "Dock bottom", and "Move down")

Provide feedback for screen reader users when the draggable element is moved. Use a visibly hidden live region, so that any updates to the region are announced to screen reader users. Ensure the region is included on page load, so that it is registered.

```html
<div class="visually-hidden" aria-live="polite"></div>
```

Update the region when the draggable element is moved:

```html
<div class="visually-hidden" aria-live="polite">
  [Name of element] moved [new position]
</div>
```

Do not display raw coordinates for the position, prefer a descriptive name (e.g. "docked left", "moved left", "moved up", and so on) or omit it if there is no meaningful description.
The message can be removed after a second, as it will be announced and no longer relevant.

As the keyboard interaction may not be obvious for some users, provide a help button in the draggable element that reveals the keystrokes to perform the operation.

## Fallback strategies

When dragging only repositions a component, treat it as progressive enhancement: without JavaScript, keep the element, its content, and its controls visible, readable, and functional in a sensible default position. Do not expose a non-functional drag handle: if the handle is a standalone grip control, hide it by default and reveal it when JavaScript initializes; if a header doubles as the handle, attach its drag affordances when JavaScript initializes.

{{ BASELINE_STATUS("user-select") }}

Include `-webkit-user-select: none` before `user-select: none` so text selection stays suppressed during dragging in Safari.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/drag/guide.md#L84-L125). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
