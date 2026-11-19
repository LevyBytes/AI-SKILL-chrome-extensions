Related section: [Position aware tooltips](overview.md).
## 4. Styling the container itself

If you need to change properties on the container itself (like `margin` or `background-color`) when it flips, you should use an **inner wrapper element**.

1. Apply `container-type: anchored` to the outer positioned element.
2. Target the inner element inside the `@container` block.


```css
@container anchored(fallback: flip-block) {
  .tooltip-content {
    border-radius: 0 0 .5rem .5rem;
    margin-block-start: 0.25rem;
  }
}
```

## 5. Styling the inner container (optional)

If the tooltip text is particularly long, use an inner container in the tooltip to ensure that, when visible, the tooltip will always fit between the trigger control and a side of the viewport. As an example, the following code will adhere to this when flipping the tooltip content on the block axis with `position-try: flip-block`.

```html
<button popovertarget="tooltip" id="anchor" aria-describedby="tooltip">anchor</button>
<div id="tooltip" popover role="tooltip">
  <div class="tooltip-content-inner"></div>
</div>
```

```css
.tooltip-content-inner {
  max-block-size: calc(50dvb - var(--trigger-height));
  overflow-block: auto;
} 
```

## Best practices

- **Prefer logical fallbacks**: Use keywords like `flip-block` and `flip-inline` in `position-try-fallbacks` for simpler queries that handle RTL and different writing modes automatically.
- **Use pseudo-elements for arrows**: Tooltip arrows are purely decorative and are perfect candidates for `::before` or `::after`, which can be styled via anchored container queries without extra DOM.

## Accessibility considerations

Using these tooltips may result in controls being obscured when they receive focus, which would result in a fail against WCAG 2.4.11 Focus Not Obscured (Minimum) (Level AA), as focused items cannot be completely obscured. While there may not be generic guidance to completely mitigate against this issue, consider strategies that adjust the position of the tooltip or its presence.

Keyboard navigation does not close a `popover=auto` tooltip, so ensure that tooltips do not obscure interactive elements as they receive focus via keyboard. If the tooltip is likely to obscure an interactive element when it receives focus, either change the position of the tooltip to prevent focus being obscured, or dismiss the tooltip if it is no longer relevant to the user.

## Fallback strategies

Browser support for Anchor position container queries: Limited availability.
Supported by: Chrome 143 (Dec 2025) and Edge 143 (Dec 2025).
Unsupported in: Firefox and Safari.

Positioning the arrow based on the applied fallback is a progressive enhancement, and there is not another way of reacting to the fallback position. To hide the arrow in browsers that don't support anchor position container queries, test for CSS support with `@supports (container-type: anchored)`.

```css
@supports (container-type: anchored) {
  .tooltip-content::before {
    content: "▼" / "";
  }
}
```

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

Browsers without support for the Popover API also do not support anchor positioning, so the tooltip will appear in the center of the screen.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-atoms/position-aware-tooltips.md#L81-L173). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
