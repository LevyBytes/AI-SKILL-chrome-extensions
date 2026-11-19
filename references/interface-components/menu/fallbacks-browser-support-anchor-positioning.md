### Fallbacks & browser support for Anchor positioning

{{ BASELINE_STATUS("anchor-positioning") }}

Without CSS Anchor Positioning, a popover falls back to the UA's centered viewport placement. Never ship that for a menu: it detaches the menu from its trigger, and a centered submenu covers its parent. Gate the anchored rules behind `@supports (position-area: block-end)` and position the menu from script when it fails:

* Place the menu below its trigger (top level) or beside it (submenu), flipping to the other side and clamping to the viewport when it would overflow.
* Run it in the `toggle` handler when the menu opens, and apply the result as `left` and `top` on the menu. Use `position: fixed` with `inset: auto` and `margin: 0` so the coordinates are viewport-relative.
* Keep these overrides inside `@supports not (position-area: block-end)`, so browsers with anchor positioning are unaffected.

{{ BASELINE_STATUS("anchor-positioning", "api.HTMLElement.showPopover.options_source_parameter.implicit_anchor_reference") }}

If targeting earlier implementations where `showPopover({ source })` does not establish an implicit anchor (no `source` on `ToggleEvent.prototype`), give each trigger a unique `anchor-name` and each menu a matching `position-anchor` from script, instead of writing per-menu CSS rules.

For browsers without anchor positioning at all, see {{ GUIDE_REF("viewport-aware-dropdowns") }} for the polyfill route.

### Fallbacks & browser support for Invoker commands

{{ BASELINE_STATUS("invoker-commands") }}

Without invokers, `command="toggle-popover"` does nothing, so script must toggle the menu.

* Feature-detect the interface, not an instance: `'commandForElement' in HTMLButtonElement.prototype`.
* On each trigger `click`, call `preventDefault()` so a browser with invokers cannot toggle twice.
* If the menu is open, close it with `closeAndRestore(menu)`. Otherwise call `menu.showPopover({ source: trigger })`.
* Mark the menu in `enterOnOpen` unless the click came from the pressed trigger (`pointerTrigger`), so only keyboard opens enter the menu.
* `Enter` and `Space` still work because they generate a click on buttons.

### Fallbacks & browser support for `:has()`

{{ BASELINE_STATUS("has") }}

If targeting browsers without `:has()`, add a class to each menu popover instead of selecting `[popover]:has(> [focusgroup~="menu"])`.

### Fallbacks & browser support for `sign()`

{{ BASELINE_STATUS("abs-sign") }}

If your Baseline target lacks `sign()`, skip `--bridge-side` and pick the edge and the apex nudge with `clamp()`: a large multiplier pushes `--pointer-x` past either bound, so the result is one end or the other.

```css
@supports not (width: calc(sign(1px) * 1px)) {
  [data-bridge]::before {
    --bridge-edge: clamp(100vw, 50% + var(--pointer-x) * 1e6, 100% - 100vw);
    --bridge-apex: calc(100vw + var(--pointer-x) + clamp(-1 * var(--bridge-slack), var(--pointer-x) * 1e6, var(--bridge-slack)));
  }
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/menu/guide.md#L352-L399). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
