Related section: [Option 1: Text Stroke](option-text-stroke.md).
```yaml
---
name: contrast-color
description: Select a readable text color with sufficient contrast on a dynamic background color.
web-feature-ids:
  - contrast-color
  - relative-color
  - text-stroke-fill
  - paint-order
  - svg-filters
---
```

# Ensure text readability with dynamic background colors

When building reusable UI components (like badges, buttons, headers, or footers) or supporting customizable themes, ensuring text remains readable against a variable background color can be challenging. The `contrast-color()` CSS function resolves to `black` (`rgb(0, 0, 0)`) or `white` (`rgb(255, 255, 255)`), maximizing the contrast ratio (targeting at least 4.5:1 WCAG AA contrast) against the specified solid `<color>` value.

## Determine optimal text color

When an element has a variable or dynamically injected background color, you can rely on the browser to compute the safest text color.

MANDATORY: Set the `color` property using the `contrast-color()` function, passing the background color (or its custom property) as the argument.

```css
.badge {
  /* Define the background color as a custom property */
  --badge-bg: #e02424;
  background-color: var(--badge-bg);
  /* MANDATORY: Dynamic contrasting color */
  color: contrast-color(var(--badge-bg));
}
```

DO NOT: Use `contrast-color()` for `background-color`. It is specifically designed for foreground colors (like text or borders) to contrast against a given background color.

## Integrate with theming

Because `contrast-color()` accepts any valid `<color>` value, including CSS custom properties, it is especially powerful within design systems. By centralizing your background themes as variables, you ensure that foreground content automatically updates its contrast whenever the theme shifts, even to user-specified colors.

DO: Reference shared background variables inside `contrast-color()` to guarantee synchronization across your application.

```css
.theme-card {
  background-color: var(--theme-surface-color);
  color: contrast-color(var(--theme-surface-color));
}

.theme-container[data-theme="light"] {
  --theme-surface-color: #f4f4f4;
}
.theme-container[data-theme="dark"] {
  --theme-surface-color: #1a1a1a;
}
.theme-container[data-theme="custom"] {
  --theme-surface-color: var(--user-custom-theme);
}
```

DO NOT: Hard-code a separate text color for each interaction state when the background is dynamic. Doing so reintroduces the very mismatch `contrast-color()` exists to prevent.

## Fallback strategies

{{ BASELINE_STATUS("contrast-color") }}

To support browsers without `contrast-color()`, you must provide a fallback. If the background color is known and fixed, use a hard-coded contrasting color. For variable background colors (such as theme custom properties where the runtime color is unknown), choose one of the five fallback strategies from the table below based on your UI requirements and browser support targets.

| Strategy | Best For... | Considerations |
| :--- | :--- | :--- |
| **Calculate contrast with `color(xyz)`** | Automated, CSS-only contrast calculation, ensures compliance with WCAG 1.4.3 Contrast (Minimum). | Highest quality CSS-only fallback. |
| **Text Shadow** | Quick readability boost on any background. | Can look "dirty" or "glowy"; may not fit all designs. |
| **Text Stroke** | Preserving font weight while ensuring edge contrast. | Use `paint-order` to avoid thinning letterforms, if available. |
| **Translucent Overlay** | Ensuring a minimum contrast area behind the text. | Changes the look of the background color under the text, requires a separate text element. |
| **SVG Filters** | Reactive contrast that updates as the background changes. | Requires a separate text element; hacky implementation. |

### Recommended: Calculate contrast with `color(xyz)`

In order to adhere to WCAG's 1.4.3 Contrast (Minimum) guideline, calculate the contrasting color using Relative Color Syntax in the CIE XYZ D65 color space, which uses relative luminance as the `y` value. Note that `white` is `color(xyz 0.9505 1 1.089)`, as this is the D65 white point.

{{ BASELINE_STATUS("relative-color") }}

{# Formula for this is from Lea Verou's blog post: https://lea.verou.me/blog/2024/contrast-color/#xyz-wcag #}

```css
--wcag-y-threshold: 0.17913;
--y: max(0, sign(var(--wcag-y-threshold) - y));
color: color(from var(--color) xyz-d65 calc(var(--y) * 0.9505) var(--y) calc(var(--y) * 1.089));
```

### Alternative CSS Fallbacks

DO: Select the fallback that best matches your design constraints if RCS is not sufficient or supported.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/visual-design/contrast-color/guide.md#L1-L90). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
