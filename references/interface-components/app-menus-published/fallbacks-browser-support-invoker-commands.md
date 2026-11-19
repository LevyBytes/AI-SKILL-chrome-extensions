### Fallbacks & browser support for Invoker commands

Baseline status for Invoker commands: Newly available. It's been Baseline since 2025-12-12.
Supported by: Chrome 135 (Apr 2025), Edge 135 (Apr 2025), Firefox 144 (Oct 2025), and Safari 26.2 (Dec 2025).

Without invokers, `command="toggle-popover"` does nothing, so script must toggle the menu.

* Feature-detect the interface, not an instance: `'commandForElement' in HTMLButtonElement.prototype`.
* On each trigger `click`, call `preventDefault()` so a browser with invokers cannot toggle twice.
* If the menu is open, close it with `closeAndRestore(menu)`. Otherwise call `menu.showPopover({ source: trigger })`.
* Mark the menu in `enterOnOpen` unless the click came from the pressed trigger (`pointerTrigger`), so only keyboard opens enter the menu.
* `Enter` and `Space` still work because they generate a click on buttons.

### Fallbacks & browser support for `:has()`

Baseline status for :has(): Widely available. It's been Baseline since 2023-12-19.
Supported by: Chrome 105 (Sep 2022), Edge 105 (Sep 2022), Firefox 121 (Dec 2023), and Safari 15.4 (Mar 2022).

If targeting browsers without `:has()`, add a class to each menu popover instead of selecting `[popover]:has(> [focusgroup~="menu"])`.

### Fallbacks & browser support for `sign()`

Baseline status for abs() and sign(): Newly available. It's been Baseline since 2025-06-26.
Supported by: Chrome 138 (Jun 2025), Edge 138 (Jun 2025), Firefox 118 (Sep 2023), and Safari 15.4 (Mar 2022).

If your Baseline target lacks `sign()`, skip `--bridge-side` and pick the edge and the apex nudge with `clamp()`: a large multiplier pushes `--pointer-x` past either bound, so the result is one end or the other.

```css
@supports not (width: calc(sign(1px) * 1px)) {
  [data-bridge]::before {
    --bridge-edge: clamp(100vw, 50% + var(--pointer-x) * 1e6, 100% - 100vw);
    --bridge-apex: calc(100vw + var(--pointer-x) + clamp(-1 * var(--bridge-slack), var(--pointer-x) * 1e6, var(--bridge-slack)));
  }
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/app-menus.md#L183-L217). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
