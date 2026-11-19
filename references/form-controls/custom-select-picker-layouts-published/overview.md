# Custom Select Picker Layouts

The CSS property `appearance: base-select` unlocks the ability to style a `<select>` element and its picker (via `::picker(select)`) like regular HTML elements.
Combined with modern CSS layout techniques like Grid or Flexbox, you can break away from the traditional stacked vertical list and create a rich visual experience without custom JS.
For example, you can use `display: grid` to style the options as a 2D grid of cards.

This is ideal for color pickers, emoji selectors, or product variants where a rich visual menu is more effective than a list.

## How to Implement

### 1. Activate Base Styling

Apply `appearance: base-select` to both the `<select>` element and its internal picker pseudo-element `select::picker(select)`:

```css
select.grid-picker {
  &, &::picker(select) {
    appearance: base-select;
  }
}

```

### 2. Style the Picker Container

Target `select:open::picker(select)` and apply `display: grid` (or `display: flex`).
Define columns and gaps as you would for any container.

```css
select.grid-picker:open::picker(select) {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}
```

IMPORTANT: The `:open` is necessary. If you style `select::picker(select)`, it will make the picker visible even when the select is closed!

### 3. Style the Options

Target the `<option>` elements to style them as grid items or cards.
You can add images, SVGs, or complex layouts inside them.

```css
/* Style options as grid cards */
.grid-picker option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* padding, border-radius, background, etc. */
}
```

### 4. Style the selected option

To style the selected *option*, use `option:checked`. For example:

```css
.grid-picker option:checked {
  position: relative;
  border: 2px solid var(--primary-color);
  background-color: oklab(from var(--primary-color) l a b / 8%);
}
```

As with any UI control, do not communicate state with color alone, and use multiple visual indicators (e.g. colors, border thickness, checkmark) to communicate which option is selected. Ensure that at least one of the visual indicators to indicate the selected state has a contrast of at least 3:1 with the background color.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/forms/custom-select-picker-layouts.md#L1-L68). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
