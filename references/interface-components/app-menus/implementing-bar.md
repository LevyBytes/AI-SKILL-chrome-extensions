Related section: [App menus](overview.md).
## Implementing the bar

1. **Roving tabindex.** Set `tabindex="0"` on the first top-level trigger and `-1` on the rest. When `ArrowLeft` or `ArrowRight` moves to another trigger, move the `0` with it. Do not put the triggers in a focusgroup: the bar needs preview on focus and menu switching, which focusgroup does not provide.
2. **Preview on focus.** A top-level trigger's `focus` handler calls `menu.showPopover({ source: trigger })` so the menu anchors to it. Ignore focus returning from inside the trigger's own menu, or from another window (flag on window `blur`, cleared a tick after window `focus`, or app-switching reopens the last menu). Hide a previewed menu on `blur` unless focus moved into it.
3. **Moving between menus.** One function closes every open top-level menu, moves the tabindex, and focuses the target trigger; preview on focus does the rest. Call it from `ArrowLeft`/`ArrowRight` on a trigger, from the same keys inside an open top-level menu, and from `ArrowRight` on a submenu item with no child submenu.

```js
// Direct children only: submenu triggers live inside the bar's nested popovers.
const rootTriggers = [...document.querySelectorAll('[role="menubar"] > [commandfor]')];

// Left/Right always land on the adjacent trigger as a preview, never inside its menu, as in
// native menubars. ArrowDown then enters.
function moveToRootTrigger(from, direction) {
  const next = rootTriggers[(rootTriggers.indexOf(from) + direction + rootTriggers.length) % rootTriggers.length];
  rootTriggers.forEach(trigger => { trigger.tabIndex = trigger === next ? 0 : -1; });
  rootTriggers.map(menuFor).filter(isOpen).forEach(menu => menu.hidePopover());
  next.focus({ preventScroll: true }); // Focusing the trigger previews its menu.
}
```

4. **Hover switches open menus.** On `pointerenter` of a top-level trigger while another top-level menu is open: hide it, focus the hovered trigger without a ring (`focus({ focusVisible: false })`), and preview on focus previews it. Nothing open: do nothing. Keep `:hover` on top-level triggers: with nothing open it is plain button feedback, with a menu open the hover switches menus and focus follows.
5. **Entering from a trigger.** `ArrowDown` on a previewed trigger focuses the first item; on a closed trigger it marks the menu to be entered and calls `trigger.click()`, so the invoker stays the only open path. `Home` and `End` preview the menu if needed, then focus its first or last enabled item.
6. **Outside focus.** The `document` `focusin` listener that closes every menu must treat the menubar as inside the menu system, or `Tab` landing on a trigger closes the menu it just previewed.
7. **Instant switching.** Native menubars switch between open menus without animation. If menus animate, disable the transition while another menu in the bar is already open:

```css
@media (prefers-reduced-motion: no-preference) {
  /* Switching between open menubar menus is instant, as in native menubars. */
  [role="menubar"]:has(> [popover]:popover-open) > [popover] {
    transition: none;
  }
}
```

## Verify before finishing

An instruction cannot guarantee behavior, so test the result. Open the page and check each of these with the real keyboard and mouse; fix and re-test any that fail. Check the menus themselves against the menu guide's list.

* **One tab stop.** `Tab` lands on the first trigger once and previews its menu; `Shift`+`Tab` from the page content returns to the bar once, not to every trigger.
* **Arrow keys.** `ArrowRight` and `ArrowLeft` on a trigger preview the adjacent menu, wrapping, without focusing an item; `ArrowDown` enters; inside an open menu, `ArrowRight` and `ArrowLeft` switch to the adjacent menu as a preview.
* **Hover.** With File open, pointing at Edit switches to it instantly; with nothing open, pointing at a trigger does nothing.
* **Window focus.** Switching to another window and back does not reopen the last menu.
* **Leaving.** `Tab` from a trigger or from inside a menu closes everything and leaves the bar.

## Fallback strategies

The bar itself is roving tabindex, focus handling, and `showPopover()`, all widely supported script. Beyond the menus, the bar only adds the `[role="menubar"]:has(> [popover]:popover-open)` rule that disables the transition while switching; without `:has()`, switching animates like a plain open.

The menus in the bar use focusgroup, popovers, invoker commands, anchor positioning, and `:has()`. Their fallbacks follow.

{{ INCLUDE("../menu/guide.md#fallback-strategies") }}

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/app-menus/guide.md#L64-L114). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
