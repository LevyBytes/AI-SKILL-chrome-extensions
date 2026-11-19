# Using and managing icons

## Choosing an Icon Technique

Icon storage and rendering are separate choices. For example, an SVG sprite can supply an icon to the CSS icon system or be referenced with `<use>`.

* **CSS icon system:** Use when CSS should choose when and which icon to show. Use a mask for a single-color icon or a background image for a full-color icon.
* **SVG with `<use>`:** Use to reuse a symbol when its built-in styling options are enough. CSS can't arbitrarily style or animate the referenced SVG's contents, but inherited properties and custom properties can be passed in when the symbol is designed to use them. For example, a path can use `fill="var(--icon-accent, currentColor)"` to let CSS color that part of the icon.
* **Inline SVG:** Use when you need arbitrary styling or animation of the SVG's contents.
* **`<img>` with CSS filters:** Avoid this for recoloring icons. Filters can't reliably apply an arbitrary CSS color value to the image, so recoloring is cumbersome and inflexible.

To decide, ask two questions. Does CSS need to pick or swap the icon (component defaults, state changes, theming)? If yes, use the CSS icon system. Do you need to reach inside the icon beyond color? If yes and you control the icon source, design the symbol with custom properties and use `<use>`; if you do not control the source, inline the SVG. Third-party icon sets rarely expose custom properties, so `<use>` against them gives you color and little else.

Whichever method you choose, make sure that all icons have a contrast of at least 3:1 against their backgrounds in light and dark color schemes. Refer to the Contrast section of `color` (via `npx -y modern-web-guidance@latest retrieve "color"`) for more details.

### Embedded or remote icons

Both the CSS icon system and `<use>` can take icons from a data URI, an individual file, or a sprite. Embedding (data URIs or inline SVG) avoids a request and renders with the first paint, but bloats CSS or HTML and cannot be cached separately, so it suits a small set of icons that appear on every page. Individual files are cached independently and loaded on demand, at the cost of one request each. A sprite is one cacheable request for the whole set, but downloads every icon whether used or not, and `<use>` can only reference a sprite from the same origin. Prefer embedding for a handful of core icons and a sprite or individual files for larger sets.

If a page renders thousands of icons at once, benchmark the actual page and assets. In a stress test, inline SVG had a small performance advantage at that scale, but results depend on the browser and implementation. [Cloud Four's SVG icon stress test](https://cloudfour.com/thinks/svg-icon-stress-test/)

## Primary Approach: CSS-Driven Icon Engine

Icons are design tokens: each icon is a custom property holding an image, and any element can display one by setting `--icon-start` or `--icon-end`. The engine combines three CSS capabilities:

* **Registered custom properties (`@property`)** keep `--icon-start` and `--icon-end` from inheriting, so an icon set on a component does not cascade into its children.
* **Container style queries (`@container style(...)`)** detect when an element has an icon assigned and render it, with no class or markup changes.
* **CSS masks and `currentColor`** render the icon in a pseudo-element that follows the element's text color. Size, color, spacing and vertical offset are read from inheritable `--icon-style-*` properties with sensible fallbacks, so a whole subtree can be restyled from an ancestor. The `--icon-style-` prefix keeps these settings from colliding with the icon tokens themselves, which also live under `--icon-*`.

### Defining icon design tokens

Define SVG icons and any `--icon-style-*` overrides as reusable custom properties using inline SVG data URIs or root-relative URLs (e.g., `url("/icons/trash.svg")`). When an icon is loaded from an external SVG file, use a root-relative URL or an embedded data URI. A relative URL used through a custom property can resolve relative to the stylesheet where the icon is used, rather than the stylesheet where the custom property is defined. If those stylesheets are in different directories, the URL may resolve to the wrong file.

To keep a URL relative to the stylesheet that defines the icon token, a registered property is meant to help: the computed value of a registered `<url>` or `<image>` is resolved against the stylesheet that declared it. DO NOT rely on registering the token as `<image>` with the URL in `initial-value`. Chrome and Safari resolve `initial-value` URLs against the document, so it only works in Firefox. Chrome also resolves values declared on `:root` against the document unless the syntax starts with `<url>`.

When relative URLs are unavoidable, such as stylesheets in different directories, register the token with a syntax that starts with `<url>` and declare the actual URL on `:root`. This resolves against the declaring stylesheet in every browser:

```css
@property --icon-caret {
  /* The syntax must start with <url>. A syntax that starts with <image> resolves against the document in Chrome. */
  syntax: "<url> | <image> | none";
  inherits: true;
  initial-value: none;
}

:root {
  /* Declared here, the URL resolves against this stylesheet */
  --icon-caret: url("icons/caret.svg");
}
```

Each icon now lives in two places, and there is much more boilerplate, so this is only worth it when a project has stylesheets in different directories and a manageable number of icons. Past a dozen or so icons, register the `--icon-*` tokens (excluding `--icon-style-*`) from a script with `CSS.registerProperty`, using the same syntax, instead of writing each `@property` by hand. Registered properties are global and do not work in shadow roots, so this may not fit every project. If root-relative URLs or data URIs are an option, they are simpler and work everywhere.

```css
:root {
  /* Optional: override the built-in fallbacks (1em, currentColor, 0.3em, -0.02em) */
  --icon-style-size: 1em;
  --icon-style-spacing: 0.4em;
  --icon-trash: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z'/%3E%3C/svg%3E");
  --icon-favorite: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/%3E%3C/svg%3E");
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-atoms/icons.md#L1-L63). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
