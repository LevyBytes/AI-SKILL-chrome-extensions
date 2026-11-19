### Rendering icons from tokens

An element displays an icon by setting `--icon-start` (leading) or `--icon-end` (trailing) to one of the tokens above. Two pieces of CSS turn that assignment into a rendered icon.

First, register `--icon-start` and `--icon-end` with `@property`. The `"*"` syntax accepts any value, and `inherits: false` is the important part: without it, an icon set on a button would inherit into every descendant, and each of them would render the icon too.

```css
@property --icon-start {
  syntax: "*";
  inherits: false;
}

@property --icon-end {
  syntax: "*";
  inherits: false;
}
```

Second, a container style query detects when the property is set on an element and renders the icon in a pseudo-element. Because the pseudo-element does not inherit `--icon-start` (it was registered as non-inheriting), the first declaration forwards the value explicitly with `inherit`. The remaining declarations handle sizing, masking, alignment and spacing. Because the fill defaults to `currentColor`, the icon adopts the element's text color and follows its transitions.

```css
/* Style query for elements configuring a start icon */
@container style(--icon-start) {
  ::before {
    --icon-start: inherit; /* Forward the value inside the query block */
    content: "" / var(--icon-style-alt, "");
    display: inline-block;
    width: var(--icon-style-size, 1em);
    height: var(--icon-style-size, 1em);
    background-color: var(--icon-style-color, currentColor);
    mask: var(--icon-start) no-repeat center / contain;
    /* Center on the cap height, nudged slightly up for optical balance */
    vertical-align: calc(0.5cap - var(--icon-style-size, 1em) / 2 + var(--icon-style-voffset, -0.02em));
    flex: none;
    pointer-events: none;
    forced-color-adjust: none;
  }

  /* Automatically add spacing ONLY if the element has other text or sibling content */
  :where(:not(.icon, :empty))::before {
    margin-inline-end: var(--icon-style-spacing, 0.3em);
  }
}
```

Each declaration earns its place:

* **`vertical-align`**: `middle` aligns to half the x-height, which sits visibly low for most icon sets. Centering on `0.5cap` keeps the icon's center fixed as `--icon-style-size` grows, and the small negative `--icon-style-voffset` compensates for the eye weighting the space above an icon more than the space below.
* **`flex: none`**: An empty pseudo-element has a zero minimum size, so inside a flex button it is the first thing to shrink when the label is long, potentially to nothing. Icon size is a design decision, not something layout pressure should negotiate.
* **`pointer-events: none`**: Keeps the icon from trapping clicks or becoming the `event.target`.
* **`forced-color-adjust: none`**: In forced-colors mode the browser otherwise replaces `background-color`, making a masked icon disappear. The mask fill is preserved, and `currentColor` still follows the forced text color.
* **`content: "" / var(--icon-style-alt, "")`**: Alternative text for generated content lets an icon-only control take its accessible name from the icon via `--icon-style-alt` (see Icon-Only Controls below). The default empty alt keeps decorative icons hidden from assistive technology.

For a trailing icon, follow the same pattern with `--icon-end` and `::after` instead of `--icon-start` and `::before`. Use `mask: var(--icon-end)` and apply spacing with `margin-inline-start` instead of `margin-inline-end`.

### Standalone and icon-only elements

For standalone icons or icon-only buttons, apply `.icon` directly to the empty element (the button itself for an icon-only control) and set its icon with `--icon`. Here, `--icon` is the higher-level property; the `.icon:empty` rule maps it to `--icon-start` for a leading icon:

```css
.icon:empty {
  --icon-start: var(--icon);
}
```

## Usage Examples

### Component defaults in the stylesheet

The main benefit of icons as custom properties is that they participate in the cascade. Set an icon on a selector and every matching element gets it, with no markup changes:

```css
.button-delete {
  --icon-start: var(--icon-trash);
}

a[href^="http"]:not([href*="example.com"]) {
  --icon-end: var(--icon-external);
}
```

```html
<button class="button-delete">Delete item</button>
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-atoms/icons.md#L64-L148). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
