# Build a popup menu

This guide covers one popup menu: a list of commands or links that users move through with arrow keys. What opens it does not matter: a button (an "Actions" or overflow button), an item in another menu (a submenu), or no visible trigger at all (a context menu).

Several triggers on one page are independent menus unless you build a bar: each is its own `Tab` stop, and nothing links them. A row of menus that act as one widget (File, Edit, View: one `Tab` stop, `ArrowLeft`/`ArrowRight` between them, hover switching) is an application menu bar. Build each menu as described here, then see `app-menus` (via `npx -y modern-web-guidance@latest retrieve "app-menus"`) for what links them.

## Commands, links, and what makes a menu

Two independent choices. Everything else here applies to both.

* **Element, per item.** A command is a `<button type="button">`; a destination is an `<a href>` that still opens in a new tab, copies as a URL, and works without script. A menu may mix them freely: two links and six commands, or one command and six links, changes nothing below.
* **Interaction model, per menu.** Arrow keys, `Home`/`End`, and `Esc` make it a menu: add the focusgroup, let it infer `menuitem` on every item whether button or link, and make it look like one (a trigger with a dropdown indicator, or a continuous bar for an application menu bar). A short list of links users `Tab` through is navigation: no focusgroup, no `role="menu"`, `role="menuitem"`, or `aria-haspopup="menu"`; keep the popover, `Esc`, and focus restoration. For navigation, see `navbar` (via `npx -y modern-web-guidance@latest retrieve "navbar"`).

Content never decides the roles. A "Products" dropdown of links can be a menu; an "Account" dropdown of commands cannot be navigation.

Use the menu pattern only for a composite widget with one tab stop and arrow-key navigation. Use a `<div focusgroup="menu nomemory">`, not the HTML `<menu>` element. Do not add `role="menu"` or `role="menuitem"` in the shared markup: native focusgroup infers those roles, and explicit roles block that inference. Add them only in the unsupported-browser fallback below. `nomemory` makes reopening start at the first item. Focusgroup moves focus; script handles activation, submenu preview, and focus restoration.

## Open and position the menu

Make each trigger a command invoker with `commandfor` and `command="toggle-popover"`. The browser opens and closes the popover on click, Enter, and Space, and keeps the trigger inside its popover's light-dismiss group, so clicking an open trigger closes it. Do not use `popovertarget` or `popovertargetaction`; this pattern uses `commandfor` instead.

Place each popover immediately after its trigger. Browsers add an implicit `aria-details` relationship only when the popover is not the next sibling, so this placement avoids it without extra attributes.

A menu with no trigger button opens from script with `showPopover({ source })`. `source` sets the implicit anchor, so pass the element the menu belongs to: the right-clicked card, or the focused element when a keyboard shortcut opens it. To open at a point instead (the pointer position, or the caret for an `@`-mention picker), anchor positioning still needs an element, so use a placeholder: an empty, zero-size `position: fixed` element kept directly before the menu, moved to the point with `left` and `top` on each open, and passed as `source`. A zero-size anchor puts the menu's corner at the point, as a native context menu does, and the flip fallbacks below still apply. Name the menu with `aria-label` instead of `aria-labelledby`. Everything else in this guide applies unchanged; where it says "trigger" for positioning, read the placeholder.

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

For how the flip fallbacks work on a plain popover, see `viewport-aware-dropdowns` (via `npx -y modern-web-guidance@latest retrieve "viewport-aware-dropdowns"`). That guide positions a button group, not a menu; for menus, the submenu placement and `--below` fallback above take precedence.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/menu.md#L1-L87). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
