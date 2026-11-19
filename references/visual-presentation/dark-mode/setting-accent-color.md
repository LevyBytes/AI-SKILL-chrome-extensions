Related section: [Dark mode](overview.md).
### Setting the accent color

Some browser UI (e.g. checked checkboxes or sliders) uses an accent color.
This resolves to the OS setting by default, but you can use the `accent-color` property to set it to a color that better aligns with the page, such as the page's brand color.

```css
html {
  accent-color: light-dark(var(--color-accent-light), var(--color-accent-dark));
}
```

{{ FEATURE_ISSUES("accent-color") }}

### Scrollbar colors

You can use `scrollbar-color` together with `light-dark()` to set custom scrollbar colors that adapt to the color scheme used.

```css
:root {
  --color-scrollbar-track: light-dark(#eee, #222);
  /* Example values: the thumb needs at least 3:1 contrast against the track */
  --color-scrollbar-thumb: light-dark(#6b6b6b, #8a8a8a);
  scrollbar-color: var(--color-scrollbar-thumb) var(--color-scrollbar-track);
}
```

{{ FEATURE_ISSUES("scrollbar-color") }}

### Further customization

Most browser UI exposes pseudo-elements to fully customize its appearance, such as:
- `::placeholder`
- `::spelling-error`
- `::grammar-error`
- `::selection`
- `::search-text`
- `::target-text`
- `::file-selector-button`

You can use `light-dark()` colors on any of these to apply colors that adapt to the used color scheme.

## 4. Varying images for light and dark mode

For CSS images, `light-dark()` can also be used to provide different image values.

IMPORTANT: Both values in `light-dark()` must be the same type. You cannot combine a color with an image.
If one of the two must be an image, use `image(<color>)` to wrap the color value.

## JS-based theme detection

Most color scheme branching should be done in CSS, which automatically adapts to changes.

Any JS reading `matchMedia("(prefers-color-scheme: dark)").matches` MUST also handle its `change` event as the system preference can change at any time.

## OPTIONAL: Implementing a color-scheme toggle

If you want to allow users to manually override their system default for this site, you can implement a dark mode toggle.
Most sites do not need a persistent toggle in the site UI.
Simply defaulting to the system color scheme is usually enough, optionally with a setting in a separate settings surface.
See {{ GUIDE_REF("dark-mode-toggle") }} for best practices around implementing a dark mode toggle (persistent or not).

## OPTIONAL: Component-specific overrides

You can override the global theme for specific elements by setting `color-scheme` on them.

For more information and gotchas, see {{ GUIDE_REF("component-specific-light-dark-theme") }}.

## Known issues to be aware of

{{ FEATURE_ISSUES("color-scheme") }}

## Fallback strategies

{{ FEATURE_FALLBACKS("color-scheme") }}

{{ FEATURE_FALLBACKS("light-dark") }}

{{ FEATURE_FALLBACKS("light-dark-image") }}

{{ FEATURE_FALLBACKS("image-function") }}

{{ FEATURE_FALLBACKS("scrollbar-color") }}

{{ FEATURE_FALLBACKS("accent-color") }}

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/visual-design/dark-mode/guide.md#L85-L168). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
