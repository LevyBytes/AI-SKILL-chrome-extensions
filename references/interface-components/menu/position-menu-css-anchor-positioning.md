### Position the menu with CSS Anchor Positioning

Use CSS anchor positioning, not JavaScript coordinates. Both `command="toggle-popover"` and `showPopover({ source: trigger })` set an implicit anchor, so do not add per-menu `anchor-name` or `position-anchor` rules. Menu behavior must not depend on anchor positioning.

```css
/* Top-level menus sit below their trigger, flipping when they would overflow. The implicit anchor comes from the invoker or source. */
[popover]:has(> [focusgroup~="menu"]) {
  position-area: block-end span-inline-end;
  position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
  inset: auto;
}

/* A popover directly inside a menu is a submenu: beside its parent item, flipping when it would overflow. */
[focusgroup~="menu"] > [popover] {
  position-area: inline-end span-block-end;
  position-try-fallbacks: flip-inline, flip-block, --below;
}

/* Last resort for narrow viewports: directly below the trigger, indented, so the submenu never
   covers its trigger. */
@position-try --below {
  position-area: block-end span-inline-end;
  margin-inline-start: 1rem;
  /* Fit the area: the submenu's minimum width must not stop this fallback from fitting. */
  min-inline-size: 0;
  max-inline-size: calc(100% - 1rem);
}
```

Keep `--below` last so it applies only when neither side fits. It opens directly under the trigger, so on a narrow screen it covers the sibling items beneath the trigger; that is the accepted trade-off for staying next to the trigger. Also let the submenu shrink to the area (`min-inline-size: 0`, `max-inline-size` minus the indent). A fallback that does not fit is skipped, and if none fit the browser keeps the base placement, so a submenu that is a few pixels too wide silently covers its trigger.

For how the flip fallbacks work on a plain popover, see {{ GUIDE_REF("viewport-aware-dropdowns") }}. That guide positions a button group, not a menu; for menus, the submenu placement and `--below` fallback above take precedence.

### Animate open and close

Optional. Under 150 ms, `opacity` and a small `translate` only, same for submenus, inside `@media (prefers-reduced-motion: no-preference)`. Focus moves on `toggle`, so the transition never delays keyboard users.

```css
@media (prefers-reduced-motion: no-preference) {
  /* Closing: this rule is in effect once :popover-open is removed. */
  [popover]:has(> [focusgroup~="menu"]) {
    opacity: 0;
    translate: 0 -.25rem;
    transition: opacity, translate, display, overlay;
    transition-duration: .15s;
    /* Separate after transition so the shorthand doesn't reset it or fail in older browsers */
    transition-behavior: allow-discrete;
  }
  /* Opening: faster. */
  [popover]:has(> [focusgroup~="menu"]):popover-open {
    opacity: 1;
    translate: 0 0;
    transition-duration: .1s;
    @starting-style { opacity: 0; translate: 0 -.25rem; }
  }
}
```

`@starting-style` is not a repeat of `[popover]`: a closed popover is `display: none`, and transitions do not run from an unrendered state, so it supplies the before-values for the open. Without it the open snaps and only the close animates. `display` and `overlay` with `transition-behavior: allow-discrete` (set as a separate declaration after `transition` so older browsers do not ignore the entire `transition` declaration) keep the popover rendered and in the top layer until the close transition ends.

## Keyboard and focus

Do not add a second roving-tabindex system inside a focusgroup. Script covers only what the invokers and focusgroup do not:

* **The trigger is an ordinary button.** `Tab` reaches it like any other button, and focusing it does not open the menu. `Enter`, `Space`, and click toggle the menu natively, so the script must not intercept these keys.
* **Keyboard open enters the menu.** Opening with `Enter` or `Space` focuses the first enabled item. `ArrowDown` on a trigger opens its menu if it is closed and focuses the first item either way, so arrow keys also work after a pointer open.
* **Pointer click on a closed trigger.** Opens it natively. Focus stays on the trigger; no item is focused. Only keyboard opens enter the menu.
* **Pointer click on an open trigger.** Closes it natively; it does not enter the menu.
  * **Known difference on submenu triggers.** A pointer click on a submenu trigger also toggles natively, so it can close a submenu that hover already previewed, or open one that has not appeared yet. Native menus only open it and never close it. This is harmless, so the guide accepts it.
* **Pointer over an item.** Focuses it without a ring, so hover and focus are one item.
* **Within a menu.** `ArrowUp` and `ArrowDown` move between enabled items. `Home` and `End` move to the first and last enabled item, which the script handles.
* **Submenu preview.** Focusing a submenu trigger, by arrow key or by pointer (which focuses it after a short delay), shows its submenu and sets `aria-expanded="true"`. Focus stays on the trigger, and no submenu item is focused. Moving to a sibling item closes the preview.
* **Enter or Space on a previewed submenu trigger.** They close the preview and keep focus on the trigger. The native `toggle-popover` action handles this.
* **ArrowRight on a submenu trigger.** Opens the submenu if needed and focuses its first item.
* **ArrowLeft or Escape in a submenu.** Closes only that submenu and restores focus to its trigger. The parent menu stays open.
* **Escape in a top-level menu.** Closes it and restores focus to its trigger.
* **Enter or Space on a command.** Activates it and closes all open menus.
* **Tab.** Leaves the menu system. Do not trap focus or step through every command. Closing must not leave focus inside hidden content.
* **No trigger button.** A menu opened from script focuses its first item when it was opened from the keyboard, and on close restores focus to the element that had it before the menu opened.

The `command` event fires before `toggle-popover` opens the menu, so focus cannot move into the menu there. Move focus in the `toggle` event instead. HTML restores focus only for the first `popover="auto"` in a stack, so nested levels must restore focus to their trigger explicitly.

## Implementing the interaction

Implement the behaviors above for your own markup. Arrow, `Home`/`End`, wrap-around and `Tab`-to-exit handling is ordinary `keydown` code. A few parts are easy to get wrong, grouped below by input type.

### Keyboard and focus handling

1. **One open path.** Opening by keyboard calls `trigger.click()`, so the invoker's `toggle-popover` is the only way a menu opens. Mark the menu so the `toggle` handler enters it, keyboard opens only. On a pointer open, `toggle` focuses the trigger without a ring instead, because `pointerdown` prevented focus and arrow keys must still work.
2. **Submenu preview on focus.** Focusing a submenu trigger calls `showPopover({ source: trigger })` so the submenu anchors to it. Ignore focus returning from inside the trigger's own submenu (after `Escape`), or from another window (flag on window `blur`, cleared a tick after window `focus`). Hide a previewed submenu on `blur` unless focus moved into it. Top-level triggers get no preview: focusing them does nothing.
3. **Move focus in `toggle`, not `command`.** `command` fires before the menu opens.
4. **Restore focus to the trigger yourself.** Focus the trigger before `hidePopover()`. After a pointer activation, restore focus without a ring (`focus({ focusVisible: false })`), or the trigger shows the keyboard focus outline after a mouse click; keyboard activations keep the ring. A click with `event.detail === 0` came from the keyboard.
5. **Close one level at a time.** Call `stopPropagation()` on `Escape` and `ArrowLeft` in a submenu, or the parent's listener closes it too.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/menu/guide.md#L73-L166). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
