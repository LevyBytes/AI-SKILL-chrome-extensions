### Not covered here

* **Activation feedback.** Native menus flash the chosen item before closing. If wanted, show a ~100 ms visual confirm before `hidePopover()`; do not delay focus restoration or the announcement.
* **Typeahead.** Focusgroup has none. If needed, on printable `keydown` match the current level's enabled item labels and focus the next match after the current item, wrapping. Do not intercept `Space`.

## Verify before finishing

An instruction cannot guarantee behavior, so test the result. Open the page and check each of these with the real keyboard and mouse; fix and re-test any that fail:

* **Keyboard.** `Tab` lands on a trigger without opening its menu; `ArrowDown` opens and enters; `Escape` closes one level and returns focus to its trigger; `Tab` closes every menu.
* **Pointer open.** Clicking a trigger opens its menu with focus on the trigger and no ring; `ArrowDown` then enters; clicking again closes it.
* **Pointer command.** Clicking a command closes every menu and shows no focus ring on the trigger.
* **Submenu.** Moving diagonally from the middle of a submenu trigger to a submenu item keeps it open; moving to an unrelated sibling closes it.
* **Narrow screen.** At 375 px no submenu covers its own trigger.
* **Check marks.** Checked items show a check mark.
* **No leftovers.** No console errors, and no `popovertarget`, `popovertargetaction` or `aria-details` on triggers.

## Align menu item content

When a row has an icon, label, and shortcut or submenu indicator, reserve a fixed-size leading slot for the icon or check mark and push the trailing content to the inline end. Icons are a known size, so a fixed slot keeps labels aligned whether or not an item has an icon. Do not use `subgrid` for rows: any extra inline child (a badge, for example) becomes its own grid item and breaks the layout. Hide shortcut text from assistive technology when it only repeats a key that already operates the item.

```css
[focusgroup~="menu"] {
  --menu-icon-size: 1.25rem;
}

/* Target items only. A closed submenu popover inside the focusgroup must keep display: none. */
[focusgroup~="menu"] > button,
[focusgroup~="menu"] > [role="group"] > button {
  display: flex;
  align-items: center;
  gap: .5rem;
}

/* The leading slot holds the icon or check mark. */
[focusgroup~="menu"] button::before {
  content: "";
  flex: none;
  inline-size: var(--menu-icon-size);
}

/* Check mark for checked items. This selector must be at least as specific as the base
   ::before rule above, or the empty content wins and the check mark never shows. */
[focusgroup~="menu"] button[aria-checked="true"]::before {
  content: "✓";
}

/* Shortcut or submenu indicator at the inline end. */
[focusgroup~="menu"] .hint {
  margin-inline-start: auto;
}
```

Put a trailing indicator or shortcut in a `<span class="hint" aria-hidden="true">` inside the button; the submenu trigger already announces its popup.

## Fallback strategies

### Fallbacks & browser support for focusgroup

{{ BASELINE_STATUS("focusgroup") }}

{# Maintainer note: Use a small capture-phase fallback instead of @microsoft/focusgroup-polyfill, which skips elements inside closed [popover] ancestors, retains references to detached DOM nodes, and misses preventDefault() on arrow keys in older Safari viewports. #}

Keep `focusgroup="menu nomemory"` in the markup. If `'focusGroup' in HTMLElement.prototype` is false, install Up, Down, Home, and End, set `role="menu"` on each menu container, and `role="menuitem"` on buttons with no role; leave checkable items, `<hr>`, and `role="group"` alone. Never install it when native focusgroup is present. Submenu preview, open, and close are author script either way.

```js
if (!('focusGroup' in HTMLElement.prototype)) {
  document.querySelectorAll('[focusgroup~="menu"]').forEach(group => {
    group.setAttribute('role', 'menu');
    group.querySelectorAll('button:not([role])').forEach(item => {
      item.setAttribute('role', 'menuitem');
    });
    group.addEventListener('keydown', event => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      // Own items only: a nested submenu has its own focusgroup, a role="group" wrapper does not.
      const items = [...group.querySelectorAll('button')]
        .filter(item => item.closest('[focusgroup]') === group)
        .filter(item => !item.disabled && item.getAttribute('aria-disabled') !== 'true');
      const current = items.indexOf(document.activeElement);
      if (current < 0) return;
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 :
        (current + (event.key === 'ArrowUp' ? -1 : 1) + items.length) % items.length;
      event.preventDefault();
      event.stopImmediatePropagation();
      items[next].focus({ preventScroll: true });
    }, true);
  });
}
```

{{ FEATURE_FALLBACKS("popover") }}


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/menu/guide.md#L260-L351). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
