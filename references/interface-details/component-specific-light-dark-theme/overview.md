Related section: [Important gotcha: Inheritance of light-dark() colors](important-gotcha-inheritance-light-dark-colors.md).
```yaml
---
name: component-specific-light-dark-theme
description: Force certain elements to be in light mode or dark mode (e.g. code blocks, media players, etc) independently of the page's color-scheme.
web-feature-ids:
  - color-scheme
  - light-dark
---
```

# Component-specific light/dark themes

While more commonly set on the root, the `color-scheme` property can be set on individual elements to force them into a different color scheme from the rest of the page.
This can be useful for components that must always be viewed in a specific color scheme (e.g. always in dark or light mode).

Example use cases include:
- Elements that are often in dark mode even on light mode pages for aesthetic reasons, e.g. code blocks, media players, photo galleries
- Areas that contain media designed for a light background (e.g. images, videos, illustrations, print previews) can be set to light mode even if the rest of the page is in dark mode.
- Elements whose color-scheme is controlled by a user-level setting, such as component previews
- Embeds that don't support both light and dark modes
- Design tools, maps, visualizations, games etc.

## When to change colors vs. when to force `color-scheme`?

Not every element that uses lighter text on darker background in light mode or darker text on lighter background in dark mode needs a different `color-scheme`.
For example, a primary button may be rendered as blue with white text in light mode, but that does not warrant a `color-scheme: dark`.

As a rule of thumb, typically elements using a different `color-scheme` are complex surfaces establishing their own visual context, rather than simple shallow containers.

When considering using a different `color-scheme` on an element, ask yourself:

- Should built-in browser UI that is not otherwise customized (e.g. form controls, scrollbars, etc) use that color-scheme or adapt to the page's color-scheme? -> if the former, don't use `color-scheme`.
- Should any `light-dark()` colors resolve like they do for the rest of the page or based on the override? -> if the former, don't use `color-scheme`.
- Should descendants be in that `color-scheme`? If not, don't use `color-scheme`.

## Basic implementation

Component-specific overrides are typically (though not strictly necessarily) used on pages that also support multiple color schemes via a global `color-scheme`.
For implementing page-wide dark mode well, see {{ GUIDE_REF("dark-mode") }}.

Once a page-wide `color-scheme` is in place, and you are using color tokens sensitive to it (e.g. via `light-dark()`), you can simply set `color-scheme` on specific components to override the color mode for that subtree:

```css
pre, code, .dark {
  color-scheme: dark;
}
```

Note that some browsers automatically adapt components to a different color scheme anyway.
To force the specified color scheme in all cases, use `only`, i.e. `color-scheme: only dark;` instead of `color-scheme: dark;`.

### Adapting non-color values

`light-dark()` currently only works for colors.

## Best practices

- **MANDATORY**: Do not set `color-scheme` on elements without a background, as that risks mixing background and text color pairs from different color-schemes, resulting in unreadable text.
- **OPTIONAL**: While it is easier to reuse the same color pairs as the page-wide dark mode, we _can_ define different color pairs for these components. For example, we may want a dark mode component used in a light mode page to be a little less dark than when the same dark mode component is used in a page that is overall in dark mode.

## Known issues to be aware of


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-atoms/component-specific-light-dark-theme/guide.md#L1-L60). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
