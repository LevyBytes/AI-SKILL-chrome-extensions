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

### Issues to be aware of when using scrollbar-color

- Do NOT animate or transition `scrollbar-color`. A [WebKit bug](https://bugs.webkit.org/show_bug.cgi?id=311752) causes the scrollbar to flicker every time `scrollbar-color` changes.
- Any computed `scrollbar-width` other than `auto` (`thin` or `none`) or computed `scrollbar-color` other than `auto` (including an inherited `scrollbar-color`) disables legacy `::-webkit-scrollbar` pseudo-elements on that element.
- With overlay scrollbars (such as the macOS default), `scrollbar-color` styles the thumb while scrolling, whereas the track may remain transparent. Ensure the thumb color has sufficient contrast against both the track color and the scrollable container's background rather than relying on the track to frame the thumb.

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
See `dark-mode-toggle` (via `npx -y modern-web-guidance@latest retrieve "dark-mode-toggle"`) for best practices around implementing a dark mode toggle (persistent or not).

## OPTIONAL: Component-specific overrides

You can override the global theme for specific elements by setting `color-scheme` on them.

For more information and gotchas, see `component-specific-light-dark-theme` (via `npx -y modern-web-guidance@latest retrieve "component-specific-light-dark-theme"`).

## Known issues to be aware of

### Issues to be aware of when using color-scheme

- Chrome and Firefox respect `color-scheme` for iframes: they render embedded pages in the correct color scheme and adjust the embedded page's `prefers-color-scheme` media query to reflect the embedding context's `color-scheme`. Safari does not, and resolves `prefers-color-scheme` to the system setting even inside iframes.
  - **If you control both parent and iframe:** pass the parent's color scheme to the iframe explicitly — via a URL parameter (`?theme=dark`) at iframe construction time, or via `postMessage()` (which also lets you react to runtime changes). In the iframe, set a class on `<html>` (and/or `color-scheme` on `:root`) from that signal instead of relying on `prefers-color-scheme`.
  - **If you only control the embedded page:** there is no reliable way to detect the embedding context's `color-scheme` from inside the iframe in Safari. Expose an explicit theme parameter on your embed API (e.g. a query string or `postMessage` protocol) and document it for embedders.

## Fallback strategies


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/visual-design/dark-mode.md#L90-L157). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
