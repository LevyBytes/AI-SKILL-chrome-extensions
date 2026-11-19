Related section: [Implementing the bar](implementing-bar.md).
```yaml
---
name: app-menus
description: Build an application menu bar where several top-level menus (such as File, Edit, and View) act as a single keyboard stop and switch between each other on hover or arrow keys.
web-feature-ids:
  - popover
  - invoker-commands
  - anchor-positioning
  - focusgroup
  - has
guides:
  - menu
---
```

# Build an application menu bar

An application menu bar (File, Edit, View, Help) is a row of menus that behaves as one widget: one `Tab` stop, `ArrowLeft` and `ArrowRight` move between menus, focusing a menu title shows its menu, and once one menu is open, pointing at another title switches to it. Use it for an application command bar.

Do not use it for site navigation (a short list of links users `Tab` through) or for a few unrelated menu buttons in a toolbar or page header. Those are standalone menus: each trigger is its own `Tab` stop, looks like a separate button, and has none of the bar behavior below.

Each menu in the bar is a complete popup menu: invoker-triggered popover, nested focusgroup, submenus, separators, checkable items, positioning, pointer handling, and fallbacks. Build them as described in {{ GUIDE_REF("menu") }}; this guide covers only what the bar adds on top of each menu.

## Structure

* Put `role="menubar"` with an `aria-label` on the container of the top-level triggers, never on a popover. Each top-level trigger is a direct child of the menubar, immediately followed by its popover.
* Each top-level trigger has an accessible name that describes its purpose, and has a `role="menuitem"` attribute.
* Style the bar as one continuous strip with no gaps or borders between triggers. Visually separate buttons signal one `Tab` stop each; a continuous bar signals one widget.
* Give the trigger with `aria-expanded="true"` a visible active style so users can tell which menu is open or previewed.

```html
<div role="menubar" aria-label="Document commands">
  <!-- Only the active trigger is tabbable; the script moves tabindex with ArrowLeft and ArrowRight. -->
  <button id="file-trigger" type="button" aria-haspopup="menu" aria-expanded="false"
    commandfor="file-menu" command="toggle-popover" role="menuitem">File</button>
  <div id="file-menu" popover="auto">
    <div focusgroup="menu nomemory" aria-labelledby="file-trigger">
      <!-- Items and submenus as in the menu guide -->
    </div>
  </div>

  <button id="edit-trigger" type="button" aria-haspopup="menu" aria-expanded="false"
    commandfor="edit-menu" command="toggle-popover" tabindex="-1">Edit</button>
  <div id="edit-menu" popover="auto">
    <div focusgroup="menu nomemory" aria-labelledby="edit-trigger">
      <!-- … -->
    </div>
  </div>
</div>
```

## Keyboard and focus

The menu guide's keyboard model applies inside every menu. The bar adds, on top of it:

* **One tab stop.** `Tab` enters at the first top-level trigger. `ArrowLeft` and `ArrowRight` move between top-level triggers and wrap at either end. `Home` and `End` on a trigger enter its menu at the first or last item.
  * **Note: which trigger `Tab` returns to.** The APG allows either the first trigger or the last one used. The guide specifies the first, but moving the tab stop with `ArrowLeft` and `ArrowRight` means that after keyboard navigation `Shift`+`Tab` returns to the last trigger reached. Pointer use does not move it, so the same sequence can land on a different trigger. Either behavior is acceptable; pick one and keep it consistent.
* **Preview.** Focusing a top-level trigger shows its menu and sets `aria-expanded="true"`. Focus stays on the trigger, and no item is focused. Blurring the trigger closes a preview-only menu.
* **Enter and Space on a preview.** They close the preview and keep focus on the trigger. The native `toggle-popover` action handles this, so the script must not intercept these keys.
* **ArrowDown on a preview.** Converts it to an open menu and focuses the first item.
* **ArrowLeft or ArrowRight in an open top-level menu.** Closes it and previews the adjacent menu with focus on its trigger, wrapping at either end. `ArrowDown` then enters it. Left and Right never land inside a menu.
* **ArrowRight on a submenu item without a child submenu.** Closes the hierarchy and previews the next top-level menu while focus stays on its trigger. `ArrowDown` then enters it.
* **Pointer over another top-level trigger while a menu is open.** Closes it and previews the hovered one, focusing its trigger without a ring. Nothing open: hover does nothing.
* **Tab.** Leaves the bar from a trigger or from inside any menu, closing every open menu.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/app-menus/guide.md#L1-L63). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
