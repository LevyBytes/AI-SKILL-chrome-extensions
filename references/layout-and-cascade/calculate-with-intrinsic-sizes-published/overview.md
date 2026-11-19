# Calculate With Intrinsic Sizes

`calc-size()` is a CSS function for performing mathematical operations on intrinsic sizing keywords like `auto`, `min-content`, and `fit-content`. **MANDATORY**: Use `calc-size()` only when you need to modify an intrinsic size with a calculation or constraint; for simple keyword-based animations (e.g., `0` to `auto`), you must use `interpolate-size: allow-keywords`.

## Implementation Steps

1. **Identify the Intrinsic Basis**: Determine which intrinsic keyword (`auto`, `min-content`, etc.) should form the base of your calculation.
2. **Define Constraints**: Use CSS math functions like `clamp()`, `min()`, or `max()` within the second argument to enforce design constraints on the intrinsic size.
3. **MANDATORY: Provide a Fallback**: Always declare a standard sizing keyword or length immediately before the property using `calc-size()` to ensure the layout remains functional in unsupported browsers.
4. **Apply Logical Properties**: Default to using logical properties like `inline-size` or `block-size` to ensure the calculations respect the document's writing mode.
5. **Optional: Progressive Enhancement**: Wrap complex layout logic or animations in a `@supports (inline-size: calc-size(auto, size + 0px))` block to deliver advanced features only to capable browsers.

## Basic Syntax

```css
/* calc-size(<calc-size-basis>, <calc-sum>) — mathematical operations on intrinsic sizing keywords */
.element {
  /* MANDATORY: Always provide a fallback for browsers that do not support calc-size() */
  inline-size: min-content;
  
  /* DO: Use calc-size to modify an intrinsic basis with a calculation or function */
  inline-size: calc-size(min-content, size + 2rem);
}
```

### Valid Basis Arguments (`<calc-size-basis>`)
The first argument defines the "base" size for the calculation.

**Standard Keywords:**
- `auto`: The default sizing for the element.
- `min-content`: The smallest size the element can take without overflowing.
- `max-content`: The size the element takes to fit all content on one line.
- `fit-content`: Equivalent to `clamp(min-content, auto, max-content)`.
- `content`: Only valid when `calc-size()` is used within the `flex-basis` property.

**Special Arguments:**
- `any`: A generic basis used when the specific intrinsic type is unknown or when nesting calculations.
- Nested `calc-size()`: Allows for multi-step or conditional calculations.
- `<calc-sum>`: A specific length, percentage, or mathematical expression (e.g., `100px` or `20%`). When a fixed value is used as the basis, the **`size` keyword is still available** (but only within the second argument) and represents the resolved value of that basis.

**MANDATORY**: The `size` keyword is **not valid** within the first argument (`<calc-size-basis>`) itself. It is a local variable that only exists to refer back to the basis from within the second argument (`<calc-sum>`).

### Valid Calculation Arguments (`<calc-sum>`)
The second argument is the mathematical expression.
- It typically uses the `size` keyword to refer to the value of the basis.
- While the `size` keyword is technically optional, omitting it means the calculation will resolve to a fixed value, ignoring the basis entirely.
- It can include standard math operators (`+`, `-`, `*`, `/`).
- It can include CSS math functions like `clamp()`, `min()`, `max()`, and `round()`.
- **MANDATORY**: `calc-size()` only allows a **single** intrinsic size value (the basis) in each calculation. You cannot mix intrinsic sizing keywords in the same `calc-size()` call.

## Use Cases

### Animating to and from Intrinsic Sizes
By default, browsers cannot interpolate between a length (e.g., `0px`) and an intrinsic keyword (e.g., `auto`). Wrapping the keyword in `calc-size()` makes it an interpolatable value.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/css/calculate-with-intrinsic-sizes.md#L1-L55). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
