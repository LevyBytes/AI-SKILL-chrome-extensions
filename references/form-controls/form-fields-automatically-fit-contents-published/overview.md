Related section: [Fallback strategies](fallback-strategies.md).
# Form Fields Automatically Fit Contents

By default, form controls like `<input>`, `<textarea>`, and `<select>` have fixed dimensions. Their sizes remain constant, regardless of the amount of content the user enters or selects.

To allow these controls to automatically shrink or grow to fit their content (including placeholders), use the `field-sizing: content` CSS property.

### Auto-sizing form controls

Setting `field-sizing: content` on inputs, selects, or textareas allows them to resize dynamically as the user types or selects options. However, you must account for inherited styling, layout defaults, and minimum/maximum constraints to ensure a robust user experience.

To prevent layout issues, it is recommended to set both `min-inline-size` (or `min-width`) and `max-inline-size` (or `max-width`) alongside `field-sizing: content` on text inputs. A minimum size prevents the input from collapsing to a width of zero when empty (making it unclickable), and a maximum size ensures it doesn't expand indefinitely and break the page layout.

For textareas, allowing horizontal auto-sizing can cause a jarring UX (e.g., a textarea with a long placeholder will abruptly shrink horizontally when the user types a single character). To prevent this, apply an explicit width (like `width: 100%`) to the textarea. This forces the textarea to maintain a stable horizontal width while still auto-sizing vertically as content wraps.

It is recommended to set a `max-inline-size` (or `max-width`) on `<select>` elements using `field-sizing: content` to ensure that extremely long selected options do not break the page layout.

```css
/* Applies horizontal auto-sizing to inputs */
input {
  /* Instructs the element to size itself to fit its content */
  field-sizing: content;

  /* Reset explicit width if inherited from global styles */
  width: auto;

  /* Prevents the input from collapsing and disappearing when empty */
  min-inline-size: 15ch;

  /* Prevents infinite horizontal growth */
  max-inline-size: 50ch;
}

textarea {
  /* Instructs the element to size itself to fit its content */
  field-sizing: content;

  /* Reset explicit height if inherited from global styles */
  height: auto;

  /* Use a fixed width to prevent jarring horizontal shifts when replacing a long placeholder */
  width: 50ch; /* or 100% depending on your layout */

  /* Sets a reasonable minimum height (e.g., 3 lines) for empty textareas */
  min-block-size: 3lh;

  /* Prevents infinite vertical growth. Once a textarea hits this */
  /* height, it will stop growing and show a vertical scrollbar. */
  max-block-size: 10lh;
}

select {
  /* Sizes the select element to fit the active option only */
  field-sizing: content;

  /* Prevents the dropdown from expanding infinitely and breaking the layout */
  max-inline-size: 50ch;
}
```

IMPORTANT: Explicit `width` and `height` properties override `field-sizing: content` on all form controls. If your project's global CSS sets inputs, selects, or textareas to `width: 100%`, you must explicitly reset them to `width: auto` (or `width: fit-content`) on the elements using `field-sizing: content` for auto-sizing to work. Conversely, you should explicitly set `height: auto` on textareas if a fixed height was previously set globally.

IMPORTANT: Grid and Flexbox layouts often implicitly stretch their children to fill available space. If any form control using `field-sizing: content` refuses to shrink, check its container's alignment properties and apply `align-self: start` or `justify-self: start` to the form control to override the stretching.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/forms/form-fields-automatically-fit-contents.md#L1-L63). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
