### Fallbacks & browser support for Clipboard API

{{ BASELINE_STATUS("async-clipboard", "api.Clipboard.writeText") }}

Where the Clipboard API is unavailable, `navigator.clipboard` is undefined and the call throws, so the `catch` branch in the feedback snippet reports the failure.

### Fallbacks & browser support for Anchor positioning

{{ BASELINE_STATUS("anchor-positioning") }}

Without anchor positioning, a popover is placed by the UA at the center of the viewport. Tooltips need no fallback: the `title` upgrade above is skipped without anchor positioning. For the overflow menu, position it from script so it stays attached to its trigger. Keep the CSS inside `@supports not (position-area: block-end)` so supporting browsers are unaffected.

```css
@supports not (position-area: block-end) {
  #more-menu {
    /* Viewport coordinates are set from script when the menu opens */
    position: fixed;
    inset: auto;
    margin: 0;
  }
}
```

```js
// Only needed without anchor positioning; place the menu below its trigger
// and flip above it when it would overflow the viewport.
menu.addEventListener("toggle", ({ newState }) => {
  if (newState !== "open" || CSS.supports("position-area", "block-end")) return;
  const t = more.getBoundingClientRect();
  const m = menu.getBoundingClientRect();
  const below = t.bottom + m.height <= innerHeight;
  menu.style.top = `${below ? t.bottom : t.top - m.height}px`;
  // Right-align with the trigger, clamped to the viewport
  menu.style.left = `${Math.max(0, Math.min(t.right - m.width, innerWidth - m.width))}px`;
});
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/toolbar/guide.md#L185-L220). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
