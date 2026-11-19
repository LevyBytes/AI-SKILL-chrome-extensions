# Brand-Consistent Range Slider

## Use the native range input

Use a labeled `<input type="range">` rather than recreating a slider with `<div>` elements or custom pointer handlers. The native control preserves keyboard and pointer interaction, touch behavior, and accessibility support. Configure `min`, `max`, `step`, and `value` for the use case.

```html
<label for="range-slider">Volume</label>
<input type="range" id="range-slider" value="70"/>
```

If the value requires a formatted label or unit, expose it in ordinary DOM content and update `aria-valuetext` when changed. Do not use `::before` or `::after` on slider pseudo-elements, as generated content on form controls is not interoperable. If a tooltip that follows the thumb is required, anchor it to the thumb with CSS anchor positioning; see `position-aware-tooltips` (via `npx -y modern-web-guidance@latest retrieve "position-aware-tooltips"`) for tooltips that stay correctly oriented when they flip.

## Choose the styling approach

For simple color customization, use `brand-consistent-forms` (via `npx -y modern-web-guidance@latest retrieve "brand-consistent-forms"`) and retain the browser’s native rendering:

```css
input[type="range"] {
  accent-color: var(--brand-color);
}
```

`accent-color` is not a complete slider styling API. Its effect on the thumb, track, and fill is user-agent-dependent. Use the pseudo-elements below when the track, thumb, dimensions, shape, or fill must be controlled.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/forms/slider.md#L1-L25). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
