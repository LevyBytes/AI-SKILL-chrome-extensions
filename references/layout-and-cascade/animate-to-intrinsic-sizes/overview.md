Related section: [Example: Transition from Intrinsic to Fixed](transition-from-intrinsic-fixed.md).
```yaml
---
name: animate-to-intrinsic-sizes
description: Smoothly animate interactive components (like accordions, menus, and expanding cards) to and from their natural dimensions.
web-feature-ids:
  - calc-size
  - interpolate-size
---
```

# Animate to Intrinsic Sizes

Animating elements to dynamic sizes like `block-size: auto` or `inline-size: max-content` has historically required JavaScript or fragile "max-height" hacks. The `interpolate-size` property and `calc-size()` function allow the browser to natively interpolate between fixed lengths and intrinsic sizing keywords.

## Implementation steps

1.  **Opt-in to keyword interpolation**: Apply `interpolate-size: allow-keywords` to a parent element (typically `:root`) to enable transitions for properties using intrinsic keywords.
2.  **Define the transition**: Set a `transition` for the sizing property (e.g., `block-size`, `inline-size`) on the target element.
3.  **Use intrinsic keywords**: Change the sizing property to a supported intrinsic keyword—`auto`, `min-content`, `max-content`, `fit-content`, or (for flex-basis) `content`—during an interaction (e.g., `:hover` or a state class).
4.  **Perform calculations (Optional)**: Use `calc-size()` if you need to perform math on an intrinsic size (e.g., `auto + 2rem`). `calc-size()` also supports the `any` keyword for basis-agnostic calculations.

## Example: Generic Expansion Pattern

You can apply this pattern to any container (like a "Show More" section or a navigation menu) to transition between a restricted height and the element's natural size.

```css
/* Opt-in globally for all children */
:root {
  /* MANDATORY: Transitions to intrinsic keywords are disabled by default for compatibility */
  interpolate-size: allow-keywords;
}

.expandable-container {
  /* 1. Define a fixed initial size (or 0) and hide overflow */
  block-size: 100px;
  overflow: hidden;
  
  /* 2. Transition the sizing property */
  transition: block-size 0.4s ease-out;
}

.expandable-container.is-expanded {
  /* 3. Smoothly animate to the intrinsic natural height */
  block-size: auto;
}
```

## Example: Calculated Intrinsic Inline-Size

```css
.badge {
  inline-size: 40px;
  overflow: hidden;
  white-space: nowrap;
  transition: inline-size 0.3s ease;
}

.badge:is(:hover, :focus-visible) {
  /* calc-size(basis, calculation) */
  /* 'size' refers to the evaluated basis (max-content in this case) */
  inline-size: calc-size(max-content, size + 20px);
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/css/animate-to-intrinsic-sizes/guide.md#L1-L62). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
