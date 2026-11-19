### Applying Constraints to Intrinsic Sizes
You can use `calc-size()` with any CSS math function—such as `min()`, `max()`, `clamp()`, or `round()`—to ensure an element's intrinsic size remains within design boundaries.

```css
.dynamic-container {
  /* MANDATORY: Always provide a fallback for browsers that do not support calc-size() */
  inline-size: fit-content;

  /* 
    DO: Establish a dynamic size based on content, while:
    1. Enforcing boundaries using CSS math functions (min, clamp, etc.)
    2. Modifying the intrinsic size with fixed or relative offsets
  */
  inline-size: calc-size(fit-content, min(size + var(--extra-space), var(--max-allowed)));
}
```

## Critical Considerations

- **Percentage Pitfalls**: Percentages inside the `<calc-sum>` are resolved against the **container's size**, not the `size` keyword. For example, `calc-size(auto, size + 10%)` adds 10% of the *parent's* width to the element's `auto` width, which may lead to unexpected results or overflows.
- **Calculations requirement**: **MANDATORY**: Use `interpolate-size: allow-keywords` instead of `calc-size()` for simple animations (e.g., `0` to `auto`). `calc-size()` should only be used when the layout requires dynamic mathematical adjustments to the intrinsic base.
- **Performance Note**: Animating box model properties like `inline-size` or `block-size` triggers layout recalculations, which can be expensive. Use `calc-size()` animations primarily for layout-critical elements where non-layout alternatives are insufficient.

## Fallback strategies

{{ BASELINE_STATUS("calc-size") }}
{{ BASELINE_STATUS("interpolate-size") }}

`calc-size()` and `interpolate-size` are **progressive enhancements**. In browsers that do not support them, the properties will be ignored and the layout will remain functional, though animations to intrinsic keywords will jump instead of transitioning. Always provide a standard keyword or length as a fallback.

```css
.element {
  /* Fallback for browsers that don't support calc-size() */
  inline-size: fit-content; 
  /* Modern browsers will override the fallback */
  inline-size: calc-size(fit-content, size + 2rem);
}
```

### Animation and Transition Fallbacks
In browsers without support for `calc-size()` or `interpolate-size`, transitions involving intrinsic sizing keywords will fail to interpolate. 

- **Graceful Degradation**: The default fallback is an "instant jump" between states (e.g., from `0` to `auto`). This is often acceptable as the layout remains functional.
- **Enhanced Experience**: Use `@supports` to apply complex layout logic or additional styling that only makes sense when smooth intrinsic animations are possible.
- **Avoid JS-based measurements**: While you could use JavaScript to measure elements and manually animate their dimensions, this is often unnecessary and can lead to layout thrashing. Relying on the native "instant jump" is the recommended fallback for modern web applications.

For animations, the fallback experience will be an instant jump to the final size. To detect support in CSS or JavaScript:

```css
/* CSS Feature Detection */
@supports (inline-size: calc-size(auto, size + 0px)) {
  .element {
    /* Apply advanced logic only when supported */
  }
}
```

```javascript
/* JavaScript Feature Detection */
if (CSS.supports('inline-size', 'calc-size(auto, size + 0px)')) {
  // Apply advanced sizing or animations
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/css/calculate-with-intrinsic-sizes/guide.md#L150-L212). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
