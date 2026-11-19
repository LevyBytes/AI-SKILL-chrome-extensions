Related section: [Button group](overview.md).
### 3. Handling States

Since you are using a real `<select>`, you can use standard CSS pseudo-classes to style the selected and focus states.

```css
/* Selected state */
option:checked {
  background: var(--brand-blue);
  color: white;
}

/* Hover state */
option:hover:not(:checked) {
  background: var(--brand-hover);
  color: #004494;
  text-decoration: underline;
}

/* Keyboard focus */
option:focus-visible {
  outline: 3px solid var(--focus-gold);
  outline-offset: -3px;
}
```

### 4. Handling Left and Right Arrow Keys

In left-to-right, top-to-bottom writing modes, selects handle Up Arrow and Down Arrow keystrokes, but do not handle Left Arrow and Right Arrow keystrokes. Because the button group is horizontal, users will expect to be able to use the Left and Right Arrow keys to change the focus in the same way as the Up and Down arrows. Use JavaScript to manage this behavior.

```js
const selects = document.getElementsByTagName("select");
[...selects].forEach((select) => {
  select.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      const options = event.currentTarget.options;
      const focused = [...options].findIndex(
        (option) => option === document.activeElement,
      );
      if (focused > 0) {
        options[focused - 1].focus();
      }
    } else if (event.key === "ArrowRight") {
      const options = event.currentTarget.options;
      const focused = [...options].findIndex(
        (option) => option === document.activeElement,
      );
      if (focused < options.length - 1) {
        options[focused + 1].focus();
      }
    }
  });
});
```

## Accessibility Benefits

Using a `<select>` for a button group provides several out-of-the-box advantages:

1.  **Form Integration**: Works automatically with `<form>` submission and the `FormData` API.
2.  **Keyboard Navigation**: Supports standard arrow key navigation and "type-to-select" functionality.
3.  **Screen Reader Support**: Announces the role and state correctly without requiring custom ARIA attributes (though `aria-describedby` remains useful for multi-select instructions).

## Multi-Select Button Groups

For multi-selection (like text formatting bold/italic/underline), add the `multiple` attribute rather than the `size` attribute.

With `appearance: base-select` applied to a `<select>` element, users don't have to hold a modifier key (`Cmd` or `Ctrl`) to select multiple options.

```html
<select id="format-select" multiple aria-describedby="multi-hint">
  <div class="wrapper">
    <!-- options here -->
  </div>
</select>
<span id="multi-hint">Multiple selection allowed.</span>
```

### Fallbacks

{{ FEATURE_FALLBACKS("tmp-customizable-select-listbox") }}

For browsers that do not support customizable select, there is not a reasonable fallback with similar styling. If the default system UI is acceptable, only apply the styles in browsers that support `appearance: base-select`.

```css
@supports (appearance: base-select){}
```

If the default system UI is not acceptable and you must support browsers without customizable select, do not use customizable selects to implement button groups.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/forms/button-group/guide.md#L84-L171). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
