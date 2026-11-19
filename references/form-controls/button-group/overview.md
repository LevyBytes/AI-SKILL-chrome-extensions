Related section: [3. Handling States](handling-states.md).
```yaml
---
name: button-group
description: "Build a button group: a set of options (mutually exclusive or not) laid out horizontally and presented as visually connected buttons."
web-feature-ids:
  - tmp-customizable-select-listbox
draft: blocked
draft-reason: "customizable-select listbox lacks horizontal keyboard nav and clean fallback (#1275)"
---
```

# Button group

Button groups (sometimes called segment controls or toggle buttons) are common UI patterns for selecting a single option from a small set, such as choosing a layout view or a text alignment. Traditionally, these were built using complex radio button hacks or entirely custom JavaScript components, which often introduced accessibility gaps.

By using the `appearance: base-select` feature, you can transform a standard `<select>` element into a fully customizable button group while retaining all the native accessibility and form integration of a standard select.

## Key Implementation Details

To create a button group, you need to use `appearance: base-select` and then style the internal `option` elements. Opt in to "listbox" behavior with a `size` attribute greater than 1, or a `multiple` attribute.

### 1. Basic Structure

Add a `size` attribute with any value greater than 1 to a `<select>` element to display it as a listbox. When `appearance: base-select` is applied, the browser allows you to style the contents of the select, and add additional elements to aid in styling.

```html
<label for="view-select">Choose View:</label>
<select id="view-select" size="4" name="view">
  <!-- Wrap the <option> elements in a wrapper for styling. -->
  <div class="wrapper">
    <option value="grid">Grid</option>
    <option value="feed">Feed</option>
    <option value="stack">Stack</option>
    <option value="list">List</option>
  </div>
</select>
```

### 2. Styling with CSS

Disable the default browser styling on a `select` with `appearance: base-select` and apply your own. Using CSS variables ensures consistency across your UI.

```css

select {
  appearance: base-select;
  border: none;
  background: transparent;
}

.wrapper {
  display: flex; /* Arrange options horizontally */
  background: #eee;
  padding: 4px;
  border-radius: calc(var(--button-radius) + 4px);
  width: max-content;
}

option {
  appearance: none; /* Remove default checkmark/styling */
  padding: 0.6rem 1.2rem;
  background: white;
  color: var(--brand-blue);
  border: 1px solid var(--brand-blue);
  border-inline-end-width: 0;
  transition: all 0.2s ease;
  text-align: center;
}

/* Connected button look: round only outer corners */
option:first-of-type {
  border-radius: var(--button-radius) 0 0 var(--button-radius);
}

option:last-of-type {
  border-radius: 0 var(--button-radius) var(--button-radius) 0;
  border-inline-end-width: 1px;
}

/* Hide the default checkmark since we use button styling */
option::checkmark {
  display: none;
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/forms/button-group/guide.md#L1-L83). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
