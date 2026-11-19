```yaml
---
name: customize-scrollbar-color-and-thickness
description: Customize the color or thickness of a scrollbar
web-feature-ids:
  - scrollbar-color
  - scrollbar-width
---
```

# Customize the color or thickness of a scrollbar

You can customize the appearance of scrollbars using the standard CSS properties `scrollbar-color` and `scrollbar-width`.

*   **`scrollbar-color`**: Accepts two `<color>` values. The first applies to the thumb (the moving part), and the second to the track (the fixed background).
*   **`scrollbar-width`**: Accepts `auto` (default), `thin` (a thinner variant), or `none` (hides the scrollbar completely while maintaining scrollability).

## Apply `scrollbar-color` and `scrollbar-width`

MANDATORY: Use `scrollbar-color` and `scrollbar-width` on the scrollable container.

Choose a thumb color with a contrast ratio of at least 3:1 against the track color, and against the container's background where the track may be transparent, such as with macOS overlay scrollbars, so users can see the thumb and how far they've scrolled (WCAG 1.4.11 Non-text Contrast).

{{ FEATURE("scrollbar-color", "usage") }}

## Fallback strategies

{{ BASELINE_STATUS("scrollbar-width") }}

{{ FEATURE_FALLBACKS("scrollbar-color") }}


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/visual-design/customize-scrollbar-color-and-thickness/guide.md#L1-L29). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
