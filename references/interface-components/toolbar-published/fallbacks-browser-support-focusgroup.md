### Fallbacks & browser support for `focusgroup`

Browser support for focusgroup: Limited availability.
Supported by: Chrome 150 (Jun 2026) and Edge 150 (Jul 2026).
Unsupported in: Firefox and Safari.

Keep `focusgroup` in the markup. Only if `'focusGroup' in HTMLElement.prototype` is false, load a roving-tabindex fallback; never install it when native focusgroup is present. The fallback implements what focusgroup does natively:

* The active item has `tabindex="0"`; all others have `tabindex="-1"`. Initially the first item is active.
* On `focusin`, move `tabindex="0"` to the focused item so returning to the toolbar (including after a click) restores position.
* In a horizontal toolbar, `ArrowRight`/`ArrowLeft` move to the next/previous item across all groups and wrap at the ends. In RTL, reverse the directions. Do not wire `ArrowUp`/`ArrowDown`.
* In a vertical toolbar, `ArrowDown`/`ArrowUp` move to the next/previous item instead, and `ArrowLeft`/`ArrowRight` do nothing.
* `Home`/`End` move to the first/last item.
* Call `preventDefault()` only for keys the toolbar handles so `Tab` keeps working.

```js
if (!('focusGroup' in HTMLElement.prototype)) {
  // items = every toolbar control across all groups, in DOM order
  items.forEach((b, i) => (b.tabIndex = i ? -1 : 0));
  bar.addEventListener("focusin", ({ target }) => {
    if (items.includes(target)) items.forEach((b) => (b.tabIndex = b === target ? 0 : -1));
  });
  // Read direction and orientation at event time so runtime changes are honored
  const vertical = bar.getAttribute("aria-orientation") === "vertical";
  // Only horizontal toolbars flip with direction: RTL does not flip Up/Down
  const rtl = getComputedStyle(bar).direction === "rtl";
  const steps = vertical
    ? { ArrowDown: 1, ArrowUp: -1 }
    : { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 };
  // keydown: look up steps[key] (or Home/End), move focus, preventDefault only for handled keys
}
```

### Fallbacks & browser support for Interest invokers

Browser support for Interest invokers: Limited availability.
Supported by: Chrome 149 (Jun 2026) and Edge 149 (Jun 2026).
Unsupported in: Firefox and Safari.

Do not load an `interestfor` polyfill here: when native interest invokers or anchor positioning are missing, the upgrade script is skipped and buttons keep their baseline `title` tooltip.

### Fallbacks & browser support for Popover

Baseline status for Popover: Newly available. It's been Baseline since 2025-01-27.
Supported by: Chrome 116 (Aug 2023), Edge 116 (Aug 2023), Firefox 125 (Apr 2024), Safari 17 (Sep 2023), and Safari iOS 18.3 (Jan 2025).

The Popover API is mostly **progressive enhancement**, but its defining behaviors — top-layer promotion, light-dismiss, and `popovertarget` invocation — have no CSS-only equivalent. Older browsers need a polyfill, or a manual fallback if you would rather not ship one.

**Polyfill:** To support the `popover` attribute in older browsers, conditionally load [`@oddbird/popover-polyfill`](https://github.com/oddbird/popover-polyfill). **MANDATORY:** Feature detect by checking for the `popover` property on `HTMLElement.prototype`, and load the polyfill **only** when native support is missing — do NOT load it unconditionally.

With a bundler or import map:

```js
// MANDATORY: Feature detect 'popover' on HTMLElement.prototype.
if (!Object.hasOwn(HTMLElement.prototype, "popover")) {
  import("@oddbird/popover-polyfill");
}
```

If not using a package manager, import from a CDN, e.g. `"https://unpkg.com/@oddbird/popover-polyfill@latest/dist/popover.min.js"`.

Caveats when using the polyfill:
- Do NOT use the `popover` IDL attribute for any code that may run before the polyfill is fully loaded. It will not be mirrored as an attribute, the popover will not be picked up by the polyfill, and the property will be shadowing the accessor the polyfill adds forever. Use `setAttribute()`/`removeAttribute()` instead.
- **Styling caveat:** The polyfill cannot define the real `:popover-open` pseudo-class, so it applies a `.\:popover-open` class instead. **MANDATORY:** Combine the two with `:is()` or `:where()`, otherwise browsers that lack `:popover-open` discard the entire rule:

```css
[popover]:is(:popover-open, .\:popover-open) {
  display: block;
}
```

### Fallbacks & browser support for `popover="hint"`

Browser support for popover="hint": Limited availability.
Supported by: Chrome 151 (Jul 2026), Edge 151 (Jul 2026), and Firefox 153 (Jul 2026).
Unsupported in: Safari.

The popover polyfill does not add `popover="hint"`. Where `popover` exists without `hint`, two tooltips can stay open at once (for example one opened by focus and one by hover). Treat this as graceful degradation: the upgrade only runs where interest invokers are supported, and other browsers keep the native `title` tooltip.

### Fallbacks & browser support for Clipboard API

Baseline status for the api.Clipboard.writeText capability: Widely available. It's been Baseline since 2020-03-24.
Supported by: Chrome 66 (Apr 2018), Edge 79 (Jan 2020), Firefox 63 (Oct 2018), Safari 13.1 (Mar 2020), and Safari iOS 13.4 (Mar 2020).

Where the Clipboard API is unavailable, `navigator.clipboard` is undefined and the call throws, so the `catch` branch in the feedback snippet reports the failure.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/toolbar.md#L160-L245). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
