### Fallbacks & browser support for Anchor positioning

Browser support for Anchor positioning: Limited availability.
Supported by: Chrome 157 (Nov 2026), Edge 157 (Nov 2026), and Safari 27 (Sep 2026).
Unsupported in: Firefox.

For the mobile menu, put an absolute fallback declaration before the `anchor()` declaration. Do not wrap this simple fallback in an `@supports` rule: an unsupported `anchor()` declaration is discarded while the preceding declaration remains valid. Without Anchor Positioning the menu still opens as a popover at a fixed offset from the top of the viewport.

```css
.site-header {
  .site-menu {
    /* Example-only offset: use roughly your header height. Browsers without anchor() keep this one. */
    inset-block-start: 4.75rem;
    inset-block-start: anchor(--menu-button bottom);
  }
}
```

For the wide floating submenu, without CSS Anchor Positioning a popover falls back to centered viewport placement, which detaches the submenu from its navbar trigger. Override the submenu to `position: fixed; margin: 0` inside `@supports not (position-area: block-end)`, and when `event.newState === "open" && !CSS.supports("position-area", "block-end")` in the submenu's `toggle` handler, compute `top` and `left` from `trigger.getBoundingClientRect()` and `submenu.getBoundingClientRect()` (placing it below the trigger, flipping above if `top + size.height > innerHeight`, and clamping `left` to `[0, innerWidth - size.width]`).

### Transitions

Baseline status for @starting-style: Newly available. It's been Baseline since 2024-08-06.
Supported by: Chrome 117 (Sep 2023), Edge 117 (Sep 2023), Firefox 129 (Aug 2024), and Safari 17.5 (May 2024).

Baseline status for transition-behavior: Newly available. It's been Baseline since 2024-08-06.
Supported by: Chrome 117 (Sep 2023), Edge 117 (Sep 2023), Firefox 129 (Aug 2024), and Safari 17.4 (Mar 2024).

Browser support for interpolate-size: Limited availability.
Supported by: Chrome 129 (Sep 2024) and Edge 129 (Sep 2024).
Unsupported in: Firefox and Safari.

Baseline status for content-visibility: Newly available. It's been Baseline since 2025-09-15.
Supported by: Chrome 108 (Nov 2022), Edge 108 (Dec 2022), Firefox 130 (Sep 2024), and Safari 26 (Sep 2025).

Gate the optional narrow submenu slide-down rules that override `[hidden]` with `display: grid` behind `@supports (interpolate-size: allow-keywords)`. Without the gate, browsers lacking keyword interpolation snap the list closed instead of sliding; with it, they keep native `[hidden]` behavior. Without `@starting-style` or `transition-behavior: allow-discrete`, the optional popover entry or exit transitions fall back to opening or closing immediately.

Without script nothing adds `is-wide`, so the header stays collapsed: the menu button opens the native popover and the submenu is a nested list. Do not write a separate no-script layout or a `no-js` class.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/navbar.md#L243-L281). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
