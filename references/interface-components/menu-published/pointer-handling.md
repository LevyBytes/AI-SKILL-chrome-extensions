### Pointer handling

1. **Pointer click toggles.** Call `preventDefault()` on `pointerdown` so the click doesn't move focus. Remember which trigger was pressed. Clicking a closed trigger opens it natively and never enters the menu; only keyboard opens enter it. Do not intercept the click.
2. **Hover follows focus.** Style `:hover` and `:focus-visible` separately. On `pointermove` over an item, call `focus({ focusVisible: false })`; browsers that ignore the option paint no ring for pointer focus anyway. Pointer focus on a submenu trigger runs the same submenu preview as keyboard focus, after a short delay so a pointer crossing the item does not flash its submenu.
3. **Safe triangle.** A static CSS bridge is too narrow: it only works when the pointer starts near the parent's edge. Let CSS draw a triangle from where the pointer left the trigger, and use script only to place it:
   * Run this only when `matchMedia('(hover: hover)').matches`; it is irrelevant to touch and keyboard.
   * Start on `pointerleave` of a submenu trigger whose submenu is open, at the event's position. Skip a `--below` submenu, which has no side edge.
   * Set `--pointer-x` and `--pointer-y` (the pointer, in px relative to the submenu's box) on the submenu, and `data-bridge` to switch the bridge on. CSS derives the rest: which side the pointer is on from the sign of `--pointer-x`, and the submenu's near-edge corners from percentages of the pseudo-element's own box.
   * Pointer moves over the bridge target the submenu, so listen there: keep the bridge while the pointer moves toward the submenu, and remove the attribute about 300 ms after it rests, when it moves away from the submenu horizontally, when it reaches an item in the submenu, or when the submenu closes. A fixed 300 ms from the leave is too short for an unhurried diagonal; a bridge that ignores a reversal makes a change of mind wait.
   * CSS gives the submenu a `::before` clipped to a triangle from that point to the near-edge corners, with a few px of slack around the point (`--bridge-slack` below) so the pointer's own position is inside the shape rather than on its edge. The apex does not follow the pointer: an apex at the pointer turns every move into a direction test, and the first step off a straight line closes the submenu. It sits over the sibling items on the pointer's path, so they never receive the hover that would close the submenu. `clip-path` also limits hit testing, so the rest of the parent menu stays interactive.
   * The submenu needs `overflow: visible` (a popover clips by default). The pseudo-element extends `100vw`/`100vh` past it on every side, so the shape's points are offset by that, and `100%` of its box is the submenu plus twice that.
   * Follow-up: a curved path (`shape()` curve commands) follows real pointer arcs better than a straight triangle.

```css
[focusgroup~="menu"] > [popover] {
  overflow: visible;

  &[data-bridge]::before {
    content: "";
    position: absolute;
    inset: -100vh -100vw; /* Room for the triangle. In this box the submenu runs from 100vw/100vh to 100% - 100vw/100vh. */
    --bridge-slack: 5px; /* The apex moves away from the submenu by this much and is twice this tall. */
    --bridge-side: sign(var(--pointer-x)); /* -1: pointer left of the submenu, 1: right. */
    --bridge-edge: calc(50% + var(--bridge-side) * (50% - 100vw)); /* The submenu's near edge. */
    --bridge-apex: calc(100vw + var(--pointer-x) + var(--bridge-side) * var(--bridge-slack));
    clip-path: polygon(
      var(--bridge-apex) calc(100vh + var(--pointer-y) - var(--bridge-slack)),
      var(--bridge-edge) 100vh,
      var(--bridge-edge) calc(100% - 100vh),
      var(--bridge-apex) calc(100vh + var(--pointer-y) + var(--bridge-slack))
    );
  }
}
```

```js
const canHover = matchMedia('(hover: hover)');

// Call on pointerleave of a submenu trigger, with its submenu.
function startBridge(submenu, event) {
  if (!canHover.matches || !submenu.matches(':popover-open')) return;
  const rect = submenu.getBoundingClientRect();
  const left = event.clientX < rect.left;
  if (!left && event.clientX <= rect.right) return; // --below: no side edge.
  submenu.style.setProperty('--pointer-x', `${event.clientX - rect.left}px`);
  submenu.style.setProperty('--pointer-y', `${event.clientY - rect.top}px`);
  submenu.dataset.bridge = '';
  let timer;
  let lastX = event.clientX;
  const stop = () => {
    clearTimeout(timer);
    submenu.removeEventListener('pointermove', extend);
    submenu.removeAttribute('data-bridge');
  };
  const extend = ({ target, clientX }) => {
    // Reached an item, or turned away from the submenu.
    if (target !== submenu || (left ? clientX < lastX : clientX > lastX)) return stop();
    lastX = clientX;
    clearTimeout(timer);
    timer = setTimeout(stop, 300);
  };
  timer = setTimeout(stop, 300);
  submenu.addEventListener('pointermove', extend);
  submenu.addEventListener('toggle', stop, { once: true });
}
```

Hover follows focus (item 2) needs one guard. The move that leaves the trigger was hit-tested before the bridge existed, so its target is the sibling under the pointer. Skip the focus when `document.elementFromPoint(event.clientX, event.clientY)` is not inside the item; later moves on the path hit the bridge, whose target is the submenu, not an item.

Also:

* **Outside focus.** Close every open menu when focus lands outside the menu system (a `document` `focusin` listener).
* **Command activation.** Announce it, then hide the root menu and restore focus to its trigger, without a ring if the activation came from a pointer. For checkable items (`menuitemcheckbox`, `menuitemradio`), wait about 300 ms before closing so the changed check mark is visible. Style a closed trigger as active only on `:focus-visible`; otherwise the restored (ringless) focus leaves it highlighted after a pointer selection.
* **`aria-expanded`.** Set it only in the `toggle` listener. It covers preview and open states, and a trigger's `aria-expanded` stays `"true"` while its menu is previewed or open.
* **Helpers.** The fallbacks below assume helpers you define for your markup: `triggers` (all `[commandfor]` buttons), `menuFor(trigger)`, `isOpen(menu)`, `closeAndRestore(menu, { fromPointer })` (focus the trigger, without a ring when `fromPointer`, then `menu.hidePopover()`), `enterOnOpen` (a `WeakSet` of menus to enter once open) and `pointerTrigger` (the trigger last pressed by a pointer).

### Submenus

* Use `popover="auto"` for submenus, placed after the submenu trigger inside the parent's `focusgroup`. Never `popover="manual"`.
* Nesting lets the browser keep the parent open, close sibling submenus, close child submenus when the root menu closes, and handle outside-click light dismiss.
* The submenu trigger keeps `aria-haspopup="menu"` and `aria-expanded`; the `toggle` listener keeps `aria-expanded` in sync.
* The keyboard script handles nested `Escape` and `ArrowLeft` as described above.
* A submenu trigger never also runs a command: one control cannot both activate and open, and `Enter` cannot mean both. Put the default action as the first submenu item, or add a separate command item beside the trigger. If a combined control is forced, document it as an accessibility tradeoff.

### Separators and checkable items

* Separate item groups with `<hr>` inside the focusgroup: a native `separator`, not focusable, skipped by focusgroup and the fallback. Never a styled `<div>`.
* A boolean option is a `<button type="button">` with `aria-checked` and an explicit `role="menuitemcheckbox"`. Focusgroup does not infer these roles, so this is the one place shared markup sets an item role.
* One of a set is a `<button type="button">` with `role="menuitemradio"` and `aria-checked`, inside a `role="group"` with an `aria-label`, in the same focusgroup.
* Script toggles `aria-checked`.
* `Enter` on a checkbox toggles and closes the menu; `Space` toggles and stays open (APG). Radios close on either key.
* Render the check mark from `[aria-checked="true"]::before`, not a separate icon element (see the CSS below).


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/menu.md#L149-L241). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
