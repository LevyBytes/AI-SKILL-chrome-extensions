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

{{ BASELINE_STATUS("container-anchor-position-queries") }}

Positioning the arrow based on the applied fallback is a progressive enhancement, and there is not another way of reacting to the fallback position. To hide the arrow in browsers that don't support anchor position container queries, test for CSS support with `@supports (container-type: anchored)`.

```css
@supports (container-type: anchored) {
  .tooltip-content::before {
    content: "▼" / "";
  }
}
```

{{ FEATURE_FALLBACKS("popover") }}

Browsers without support for the Popover API also do not support anchor positioning, so the tooltip will appear in the center of the screen.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-atoms/position-aware-tooltips/guide.md#L89-L151). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
