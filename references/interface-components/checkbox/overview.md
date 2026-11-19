```yaml
---
name: checkbox
description: Style checkboxes, including custom icons, layout, colors, check/uncheck animations, while preserving native functionality and accessibility.
web-feature-ids:
  - accent-color
  - indeterminate
  - individual-transforms
  - masks
---
```

# Styling Checkboxes

Use semantic, accessible HTML with each checkbox associated with its label, either by nesting the `<input>` inside the `<label>` or by matching the label’s `for` attribute to the input’s `id`.

Modern CSS provides two approaches to styling checkboxes: customize the native appearance with `accent-color`, or override the default presentation with `appearance: none` on the `<input type="checkbox">` element.

## Native customization with `accent-color`

For simple, brand-consistent styling that retains native rendering, keyboard behavior, validation, and operating-system focus indicators, use `accent-color`.

```css
.checkbox-native {
  accent-color: #1a73e8;

  /* Sizing is controlled via relative units */
  inline-size: 1.25em;
  aspect-ratio: 1;
  margin: 0;
  cursor: pointer;
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/checkbox/guide.md#L1-L32). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
