```yaml
---
name: menu
description: Build a menu component that displays a list of options or actions, with support for nested submenus.
web-feature-ids:
  - popover
  - invoker-commands
  - anchor-positioning
  - focusgroup
  - has
  - abs-sign
guides:
  - viewport-aware-dropdowns
---
```

{# Maintainer note: this is the shared core for every popup menu (menu buttons, overflow menus, context menus, submenus). It is agnostic to what opens the menu. Behavior that only exists when several menus form one bar (one Tab stop, Left/Right between menus, preview on focus, hover switching) lives in app-menus. #}

# Build a popup menu

This guide covers one popup menu: a list of commands or links that users move through with arrow keys. What opens it does not matter: a button (an "Actions" or overflow button), an item in another menu (a submenu), or no visible trigger at all (a context menu).

Several triggers on one page are independent menus unless you build a bar: each is its own `Tab` stop, and nothing links them. A row of menus that act as one widget (File, Edit, View: one `Tab` stop, `ArrowLeft`/`ArrowRight` between them, hover switching) is an application menu bar. Build each menu as described here, then see {{ GUIDE_REF("app-menus") }} for what links them.

## Commands, links, and what makes a menu

Two independent choices. Everything else here applies to both.

* **Element, per item.** A command is a `<button type="button">`; a destination is an `<a href>` that still opens in a new tab, copies as a URL, and works without script. A menu may mix them freely: two links and six commands, or one command and six links, changes nothing below.
* **Interaction model, per menu.** Arrow keys, `Home`/`End`, and `Esc` make it a menu: add the focusgroup, let it infer `menuitem` on every item whether button or link, and make it look like one (a trigger with a dropdown indicator, or a continuous bar for an application menu bar). A short list of links users `Tab` through is navigation: no focusgroup, no `role="menu"`, `role="menuitem"`, or `aria-haspopup="menu"`; keep the popover, `Esc`, and focus restoration. For navigation, see {{ GUIDE_REF("navbar") }}.

Content never decides the roles. A "Products" dropdown of links can be a menu; an "Account" dropdown of commands cannot be navigation.

Use the menu pattern only for a composite widget with one tab stop and arrow-key navigation. Use a `<div focusgroup="menu nomemory">`, not the HTML `<menu>` element. Do not add `role="menu"` or `role="menuitem"` in the shared markup: native focusgroup infers those roles, and explicit roles block that inference. Add them only in the unsupported-browser fallback below. `nomemory` makes reopening start at the first item. Focusgroup moves focus; script handles activation, submenu preview, and focus restoration.

{# Maintainer note: Nest [focusgroup] inside [popover] rather than on the same element because Chromium clobbers focusgroup keyboard behavior on [popover] elements (https://issues.chromium.org/issues/564673920, https://github.com/whatwg/html/issues/11641). Placing each [popover] as the immediate nextElementSibling of its [commandfor] trigger suppresses the implicit aria-details relation per HTML-AAM (https://www.w3.org/TR/html-aam-1.0/#att-command-popovers) and allows nested submenus to use popover="auto" without light-dismissing their parent menu. #}

## Open and position the menu

Make each trigger a command invoker with `commandfor` and `command="toggle-popover"`. The browser opens and closes the popover on click, Enter, and Space, and keeps the trigger inside its popover's light-dismiss group, so clicking an open trigger closes it. Do not use `popovertarget` or `popovertargetaction`; this pattern uses `commandfor` instead.

Place each popover immediately after its trigger. Browsers add an implicit `aria-details` relationship only when the popover is not the next sibling, so this placement avoids it without extra attributes.

A menu with no trigger button opens from script with `showPopover({ source })`. `source` sets the implicit anchor, so pass the element the menu belongs to: the right-clicked card, or the focused element when a keyboard shortcut opens it. To open at a point instead (the pointer position, or the caret for an `@`-mention picker), anchor positioning still needs an element, so use a placeholder: an empty, zero-size `position: fixed` element kept directly before the menu, moved to the point with `left` and `top` on each open, and passed as `source`. A zero-size anchor puts the menu's corner at the point, as a native context menu does, and the flip fallbacks below still apply. Name the menu with `aria-label` instead of `aria-labelledby`. Everything else in this guide applies unchanged; where it says "trigger" for positioning, read the placeholder. {# PENDING_GUIDE_REF: For opening a menu from a right-click or long-press, see {{ GUIDE_REF("context-menu") }}. #}

```html
<!-- Command invoker: the browser toggles the popover on click, Enter, and Space -->
<button id="actions-trigger" class="trigger" type="button" aria-haspopup="menu" aria-expanded="false"
  commandfor="actions-menu" command="toggle-popover">
  Actions
</button>
<!-- Immediately after its trigger, so browsers add no implicit aria-details -->
<div id="actions-menu" popover="auto">
  <!-- Nested, not on the popover: Chromium otherwise drops focusgroup keyboard behavior -->
  <div focusgroup="menu nomemory" aria-labelledby="actions-trigger">
    <button type="button">Duplicate</button>
    <button type="button">Rename</button>
    <button id="export-trigger" type="button" aria-haspopup="menu" aria-expanded="false"
      commandfor="export-menu" command="toggle-popover">
      Export <span aria-hidden="true">›</span>
    </button>
    <!-- Submenu: popover="auto" directly after its trigger, inside the parent focusgroup -->
    <div id="export-menu" popover="auto">
      <div focusgroup="menu nomemory" aria-labelledby="export-trigger">
        <button type="button">PDF</button>
        <button type="button">Plain Text</button>
      </div>
    </div>
  </div>
</div>
```

Name each menu with `aria-labelledby` pointing at its trigger. Keep decorative submenu indicators in CSS, or add `aria-hidden="true"`. Give triggers with `aria-expanded="true"` a visible active style so users can tell which menu is open. Outside a menu bar, style each trigger as a standalone button: it is its own `Tab` stop, and the styling must say so. Anything that links triggers (`role="menubar"`, arrow keys between them, preview on focus) belongs to the application menu bar.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/menu/guide.md#L1-L72). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
