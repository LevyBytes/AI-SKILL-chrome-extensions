Related section: [Physics based easing](overview.md).
#### JavaScript Library Fallback (Motion/GSAP)

Optional: If a high-fidelity physics animation is critical even in older browsers, use a JavaScript library like **Motion** (motion.dev) or **GSAP** (greensock.com) to handle the animation when `linear()` is unsupported.

1.  **Detect support:** Use `CSS.supports()` to check if the browser handles the `linear()` function.
2.  **Conditionally load/apply:** If unsupported, use the library's spring or bounce implementation.

```javascript
/* Detect if the browser supports the linear() function */
const supportsLinearEasing = window.CSS && CSS.supports('animation-timing-function', 'linear(0, 1)');

if (!supportsLinearEasing) {
  /* 
     Example using Motion (motion.dev) for a spring fallback.
     This should only be initialized if native CSS support is missing.
  */
  import("https://cdn.jsdelivr.net/npm/motion@latest/dist/motion.js").then(({ animate, spring }) => {
    animate(".element", { transform: "scale(1.2)" }, {
      easing: spring({ stiffness: 100, damping: 10 })
    });
  });
}
```

You can also use `@supports` in CSS for more explicit feature detection:

```css
@supports not (animation-timing-function: linear(0, 1)) {
  .element {
    /* Alternative experience for unsupported browsers */
    transition-duration: 0.4s;
    transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/physics-based-easing/guide.md#L92-L126). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
