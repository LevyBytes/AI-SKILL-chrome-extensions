Related section: [4. Accessibility and Interaction](accessibility-interaction.md).
```yaml
---
name: interactive-content-reveal
description: Create interactive reveal effects, such as a spotlight that follows the user's pointer to uncover details within an image or UI section.
web-feature-ids:
  - masks
  - registered-custom-properties
---
```

# Interactive Content Reveal

Add performant, interactive reveal effects to your site with CSS masks and registered custom properties. By using a radial gradient as a mask and registering its stop values, we can smoothly transition the entry and exit, while following a user's pointer with minimal JavaScript. 

## Implementation

### 1. Register Custom Properties
To enable smooth interpolation of gradient stop values, you must register the variables using `@property`. This informs the browser's engine about the data type, allowing it to transition between values during updates.

```css
/* Register the spotlight inner and outer sizes to enable interpolation */
 @property --inner-size{
  syntax: "<length-percentage>";
  inherits: true;
  initial-value: 0px;
}
@property --outer-size{
  syntax: "<length-percentage>";
  inherits: true;
  initial-value: 0px;
}
```

The custom properties tracking the pointer position do not need to be transitioned, so it is not required to register them.

### 2. Define the Masking Layer
Apply the `mask-image` to the element you want to reveal. Use a `radial-gradient` that references the registered properties.

```css
.reveal-layer {
  /* Only transition the size properties, NOT the position variables */
  transition: --inner-size 0.2s ease-in-out, --outer-size 0.2s ease-in-out;  

  /* The spotlight is defined by the transparent center of the mask */
  mask-image: radial-gradient(
    circle at var(--mouse-x) var(--mouse-y),
    black var(--inner-size, 0%),
    transparent var(--outer-size, 0%)
  );

  /* Ensure the mask doesn't repeat if the element is large */
  mask-repeat: no-repeat;

  /* Make the mask layer non-interactive */
  pointer-events: none;
}

/* Update the gradient stops when hovering the interactive container (inherits into .reveal-layer; .reveal-layer itself has pointer-events: none) */
.container:hover {
  --inner-size: 100px;
  --outer-size: 120px;
}
```

### 3. Update Coordinates with JavaScript
Track the pointer position and update the CSS variables on pointermove events. Because position variables update immediately without transition, the spotlight follows the pointer directly while the size properties expand or contract smoothly.

```javascript
const container = document.querySelector('.container');
// Store the container's bounding rect
let rect = container.getBoundingClientRect();
// Update the rect when the container is resized
const resizeObserver = new ResizeObserver(()=>{
  rect = container.getBoundingClientRect();
})
resizeObserver.observe(container);

container.addEventListener('pointermove', (e) => {
  // Calculate position as a percentage of the container.
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;

  // Update the position properties
  container.style.setProperty('--mouse-x', `${x}%`);
  container.style.setProperty('--mouse-y', `${y}%`);
});
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/interactive-content-reveal/guide.md#L1-L86). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
