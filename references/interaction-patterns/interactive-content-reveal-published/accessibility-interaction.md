Related section: [Interactive content reveal](overview.md).
### 4. Accessibility and Interaction
**MANDATORY Accessibility Guarantee:** This pattern relies on pointer interactions to reveal a visual spotlight. You MUST guarantee that all underlying content remains fully visible, legible, and independently keyboard-reachable by default in the underlying layout, using the spotlight layer purely as a non-essential visual enhancement for pointer users. Never use this effect to obscure or gate essential content from keyboard-only or assistive technology users.

* **Pointer Events:** Set `pointer-events: none` on the mask overlay layer to allow standard click and touch interactions to pass through to controls underneath.
* **Reduced Motion Override:** Disable smooth transition interpolation for users requesting reduced motion.

```css
/* MANDATORY Copy-Paste Safety: Disable transition scaling for motion-sensitive users */
@media (prefers-reduced-motion: reduce) {
  .reveal-layer {
    transition: none !important;
  }
}
```

Make sure that all underlying content can still be reached even at very high zoom levels. In particular, make sure that all content that uses this pattern:

* Can be scaled up to 200% using a browser's built-in zoom without loss of functionality
* Is visible and operable without requiring two-dimensional scrolling when scaled up to 400% in a starting viewport size of 1280 CSS pixels by 1024 CSS pixels

Make sure that transitions do not flash more than three times in any one second period.

## Fallback strategies

Baseline status for Registered custom properties: Newly available. It's been Baseline since 2024-07-09.
Supported by: Chrome 85 (Aug 2020), Edge 85 (Aug 2020), Firefox 128 (Jul 2024), and Safari 16.4 (Mar 2023).

### Non-registered Property Fallback
Browsers that support `mask-image` but not `@property` will still show the spotlight, but the movement will jump between on and off states because they cannot interpolate values inside a `radial-gradient`. Provide fallback values when using `var()`.

```css
.reveal-layer {
  mask-image: radial-gradient(
    circle at var(--mouse-x) var(--mouse-y),
    /* Use fallback values when using the `var()` function for browsers that don't get an initial value from the @property registration. */
    black var(--inner-size, 0%),
    transparent var(--outer-size, 0%)
  );
}
```

Baseline status for Masks: Widely available. It's been Baseline since 2023-12-07.
Supported by: Chrome 120 (Dec 2023), Edge 120 (Dec 2023), Firefox 53 (Apr 2017), and Safari 15.4 (Mar 2022).

### Basic Mask Support

For browsers that do not support CSS masking at all:
1. **Prefixed property:** Use the `-webkit-mask-image` prefixed property for broader browser support.
2. **Progressive Enhancement:** Design the base state of the UI to be fully functional and legible without the reveal effect. This is useful when the effect is only adds visual flair, and not a requirement for reading content.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/interactive-content-reveal.md#L79-L127). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
