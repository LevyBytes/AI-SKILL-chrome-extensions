### 5. (Optional) Style the selected option checkmark

By default, the browser renders a checkmark as the first child of every `<option>`.

It behaves like a `::before` with `content: "✓" / ""`, rendered before an author-provided `::before`, if one exists.

If the option is not selected, the checkmark is hidden via `visibility: hidden`.

You can style it using the `::checkmark` pseudo-element, or hide it entirely if you want to convey selection via styling alone or use a custom indicator.

For example, to place it at the top-right corner of the option, you could do something like:

```css
select.grid-picker {
  > option::checkmark {
    /* Hide the checkmark for unselected options */
    display: none;
  }

  > option:checked {
    position: relative;

    &::checkmark {
      position: absolute;
      inset-block-start: -.4em;
      inset-inline-end: -.5em;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      min-inline-size: 1.6em;
      aspect-ratio: 1;
      padding-right: 0.12em;
      padding-left: 0.05em;
      border-radius: 50%;
      background: var(--primary-color);
      color: white;
      font-size: 70%;
      font-weight: bold;
    }
  }
}
```

**Tip:** When painting a container (e.g. a circle) around the checkmark, nudge it a little towards the top (as we did here with `padding-bottom` and `padding-left`) for optical centering that accounts for its shape.
Do NOT use `padding-inline-start` or `padding-block-end` for this, as they will change depending on writing mode, whereas the shape of the checkmark does not.

### 6. (Optional) Customize the selected option display

By default, the `<select>` will show a text-only version of the selected option.
To display rich content for the selected value, use `<selectedcontent>` inside a `<button>` and/or to display the selected option differently (e.g. hide certain details).

**DO NOT** use `<selectedcontent>` without the `<button>` around it, as the `<selectedcontent>` will just become part of the picker, like any other content element.

### Best practices

- Test layout behavior. Setting `appearance: base-select` removes the default browser behavior of sizing the select based on its longest option width. You may need to set a fixed width or use flex/grid constraints to prevent layout shifts.
- Ensure your `<select>` has a `name` attribute and an associated `<label>`. This ensures that even with a custom UI, the component remains accessible to screen readers and works correctly with standard form submissions.
- Use standard `value` attributes on options to ensure form submission works exactly as before.

## Accessibility

A native `<select>` only handles linear Up/Down arrow navigation, so Left/Right do nothing in the open picker and Up/Down still navigate items sequentially, regardless of rows and columns.

To add horizontal navigation that follows the grid, you can intercept `keydown` for the `Left` and `Right` arrow keys and route focus to the nearest option in the pressed direction (e.g. using `getBoundingClientRect()`).
To determine the appropriate next/previous item, use DOM methods that operate on actual geometry (e.g. `getBoundingClientRect()`) rather than parsing CSS strings like `grid-template-columns` or `grid-column`, which can be brittle and error-prone for complex grids, subgrid, RTL, and other layout scenarios.
That said, do not unnecessarily overengineer; use what invariants you know are true about the layout to simplify this logic.

**Note:** This _only_ addresses keyboard navigation. The `<select>` and its `::picker()` still have their default roles (`menu` or `listbox`), and these cannot be overridden, nor are they allowed to contain an element with `role="grid"`.
It is not valid to apply grid semantics in a `::picker()` pseudo-element as it's against its content model.
Because grid roles will not be conveyed to screen reader users, ensure that the `Down` and `Up` arrow keys still move focus sequentially to the next and previous item respectively (for example, by flowing the grid in columns or grouping columns with `<optgroup>`), even when `Left` and `Right` have been scripted, so screen reader users visit all options in the list.
Otherwise, it may be ultimately necessary to switch to a custom solution using the popover API, anchor positioning, and `role="grid"` to achieve the desired UX for screen reader users.

Ensure that the focus indicator when moving through the options has a contrast of at least 3:1 with the background color or adjacent color.

## Fallback Strategy


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/forms/custom-select-picker-layouts.md#L69-L145). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
