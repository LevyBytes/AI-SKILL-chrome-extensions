### Changing icons with state

Because the icon is just a property, a state change is an ordinary CSS override. There is no second element to show or hide and no class to toggle:

```css
.button-expand {
  --icon-start: var(--icon-caret-right);
}

.button-expand[aria-expanded="true"] {
  --icon-start: var(--icon-caret-down);
}
```

The same applies to presentation: set `--icon-style-size`, `--icon-style-color` or `--icon-style-spacing` on a container such as a toolbar and every icon inside it updates.

### One-off icons with inline styles

An element that no component rule covers can set the same property inline, for example `<button style="--icon-start: var(--icon-trash)">`. Treat this as the escape hatch rather than the default: once the same icon appears on the same kind of element more than once, move it into a stylesheet rule.

### Icon-Only Controls

Icon-only buttons use the `.icon` class and `--icon` described above. Give the button an accessible name with `aria-label`, or let the icon supply one through `--icon-style-alt`; without either, the CSS-generated icon is decorative. For standalone informative icons, expose the `.icon` element with `role="img"` and `aria-label`:

```css
.button-close {
  --icon: var(--icon-close);
  --icon-style-alt: "Close";
}
```

```html
<!-- Icon-only interactive control, icon and name from the stylesheet -->
<button class="icon button-close"></button>

<!-- Icon-only interactive control, named via aria-label -->
<button class="icon" style="--icon: var(--icon-trash);" aria-label="Delete item"></button>

<!-- Standalone informative icon -->
<span class="icon" style="--icon: var(--icon-favorite);" role="img" aria-label="Favorite"></span>
```

## Working with SVG directly

When the CSS icon system is not the right fit, use inline SVG and `<use>` together rather than as alternatives. Inline the SVG the first time an icon appears on a page and reference it with `<use href="#id">` for every repeat; the local reference costs no request and has no cross-origin restriction. Reserve an external sprite (`<use href="/icons.svg#id">`) for icons shared across many pages.

With `<use>`, the referenced content is cloned into a shadow tree, so page CSS cannot select its elements. What does reach it is inheritance: `color`, `currentColor`, and any custom property. Beyond SVG presentation attributes, modern CSS can change many geometry attributes as well, so an icon you control can expose exactly the hooks you need, for example `stroke-width="var(--icon-stroke, 2)"` or even `d: var(--icon-path, path(…))` on a particular path.

Browser support for the css.properties.d capability: Limited availability.
Supported by: Chrome 52 (Jul 2016), Edge 79 (Jan 2020), and Firefox 97 (Feb 2022).
Unsupported in: Safari.

CSS `d` is not supported in Safari, so use this customization only when that support gap is acceptable. If you do not control the icon, inline it.

`<use>` gotchas worth knowing:

* The `viewBox` must be on the `<symbol>` or referenced `<svg>`; the outer `<svg>` wrapping `<use>` does not pick it up from the reference, so set `width` and `height` on the wrapper and keep the `viewBox` with the symbol.
* Styles do not cross the boundary in either direction: `<style>` inside an external sprite does not apply to the page, and page stylesheets do not apply inside the referenced tree. Only inherited properties and custom properties pass through.
* External references are same-origin only; cross-origin sprites fail silently.
* Sprites inlined into the document share the page's `id` namespace, so namespace symbol ids to avoid collisions.

Mark decorative SVGs with `aria-hidden="true"` and give the containing control its own accessible name, as with the CSS icon system.

## Fallback Strategies

### Registered Custom Properties

Baseline status for Registered custom properties: Newly available. It's been Baseline since 2024-07-09.
Supported by: Chrome 85 (Aug 2020), Edge 85 (Aug 2020), Firefox 128 (Jul 2024), and Safari 16.4 (Mar 2023).

Without `@property`, `--icon-start` and `--icon-end` behave as ordinary inheriting custom properties, so an icon set on an element would also render on its descendants. Prevent this by resetting the properties on children inside the style query (`@container style(--icon-start) { * { --icon-start: initial; } }`), the same approach the Safari workaround below uses.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-atoms/icons.md#L149-L220). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
