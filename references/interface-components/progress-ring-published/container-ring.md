#### Container and Ring

The wrapper provides the positioning context. The `<progress>` element handles the visual gradient. Forced colors mode removes background gradients, so in `@media (forced-colors: active)`, opt the ring out with `forced-color-adjust: none` and draw it with system colors, or the ring disappears.

```css
.progress-ring-wrapper {
  position: relative;
  display: grid;
  place-items: center;
}

progress.progress-ring {
  --size: 150px;
  --thickness: 16px;
  --track-color: #f1f5f9;
  --fill-color: #3b82f6;
  --value: attr(value type(<number>));
  width: var(--size);
  height: var(--size);

  transition: --value 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 50%;

  background: conic-gradient(
    var(--fill-color) calc(var(--value) * 1%),
    var(--track-color) 0
  );

  /* MANDATORY: Clip the background to the border-area. */
  background-clip: border-area;
  border: var(--thickness) solid transparent;
  background-origin: border-box;

  @media (forced-colors: active) {
    /* Keeps the gradient, which forced colors mode removes, and draws it in system colors */
    forced-color-adjust: none;
    --fill-color: CanvasText;
    --track-color: Canvas;
  }
}

.progress-ring-content {
  /* Positioned in the center of the wrapper */
  position: absolute;
}
```

You can also use a `radial-gradient` to make rounded end caps.

#### Enable smooth transitions with `@property`

To animate the progress ring smoothly when the value changes, register `--value` as a numeric custom property. 

Users with motion sensitivities may find the transition between values disorienting. Respect the `prefers-reduced-motion` media query by having a 0 second (immediate) duration by default, and setting a longer time for users with no preference.


```css
@property --value {
  syntax: '<number>';
  inherits: true;
  initial-value: 0;
}

progress.progress-ring {
  transition: --value 0s ease-in-out;
  @media (prefers-reduced-motion: no-preference) {
    transition-duration: 0.4s;
  }
}

```

### 3. Progress Updates

Update the `value` attribute on the `<progress>` element and the text content of `.progress-ring-content` (if displaying a percentage) whenever the value changes.

### 4. Optional Success State

You can use the CSS attribute selector to automatically update the ring's appearance (e.g., changing the color to green) when the task reaches completion.

```css
/* Change the fill color to green when the progress reaches 100% */
progress.progress-ring[value="100"] {
  --fill-color: #10b981;
}
```

## Fallback strategies

Do not add a fallback value inside the `<progress>` element. It is not used by assistive technology and ignored by all modern browsers.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/progress-ring.md#L61-L151). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
