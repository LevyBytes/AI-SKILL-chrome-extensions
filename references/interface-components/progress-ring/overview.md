```yaml
---
name: progress-ring
description: Build a progress ring component that visually represents the completion status of a task or process, with support for content in the center and brand-consistent styling.
web-feature-ids:
  - progress
  - conic-gradients
  - masks
  - registered-custom-properties
  - background-clip-border-area
  - attr
---
```

# Progress ring

A progress ring (or circular progress bar) provides visual feedback on the status of a task. Unlike a linear progress bar, its circular shape is ideal for dashboards, card components, or anywhere space is constrained.

This guide implements a progress ring by:

- Using the native `<progress>` element as the semantic foundation to ensure the component is accessible to screen readers and keyboard users out-of-the-box.
- Styling the component with `conic-gradient()` and `mask-image`, allowing for a fully responsive and themeable ring without the complexity of SVG path manipulation.
- Leveraging CSS Custom Properties and `@property` to enable smooth, GPU-accelerated transitions of the progress fill.

This approach is preferred over SVG-only solutions because it uses the semantic `<progress>` element rather than ARIA, and more easily integrates with existing layout, design systems and typography.

See the {{ GUIDE_REF("spinner") }} for handling indeterminate loading states.

## Implementation

### 1. Markup

Use a wrapper to hold both the visual ring and the optional center content. The `<progress>` element remains the semantic source of truth. Use a utility class to visually hide the native progress bar while keeping it accessible.

```html
<div class="progress-ring-wrapper">
  <progress value="75" max="100" aria-label="Task progress" class="progress-ring"></progress>
  <!-- Optional: Content to display in the center. Hidden from assistive
       technologies because it repeats the value of the <progress> element. -->
  <div class="progress-ring-content" aria-hidden="true">
    75%
  </div>
</div>
```

Hide the center content from assistive technologies with `aria-hidden="true"`. The `<progress>` element already exposes its value, so screen readers would otherwise announce it twice.

If the center content shows the value in another form, such as "3 of 5 files" or a percentage, set the same text in `aria-valuetext` on the `<progress>` element whenever you update it, otherwise screen readers only get the number.

### 2. Styles

#### Hiding Native UI
To style the `<progress>` element as a progress ring, first hide the default browser styling for progress bars.

```css
/* Hide native bars */
progress.progress-ring::-webkit-progress-bar {
  display: none;
  background: none;
}
progress.progress-ring::-webkit-progress-value {
  display: none;
  background: none;
}
progress.progress-ring::-moz-progress-bar {
  display: none;
  background: none;
}
progress.progress-ring::slider-fill {
  display: none;
  background: none;
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/progress-ring/guide.md#L1-L72). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
