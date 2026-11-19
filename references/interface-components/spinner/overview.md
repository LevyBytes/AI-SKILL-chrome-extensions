```yaml
---
name: spinner
description: Build a loading spinner that communicates busy state to all users, respects reduced-motion preferences, and animates efficiently.
web-feature-ids:
  - prefers-reduced-motion
  - conic-gradients
  - progress
  - registered-custom-properties
  - background-clip-border-area
---
```

# Loading spinner

A loading spinner (or activity indicator) informs users that a process is underway when the exact duration is unknown. Unlike a progress ring, a spinner is "indeterminate" and typically uses animation to signal activity.

This guide implements a spinner by:

- Using the native `<progress>` element as the semantic foundation. By omitting the `value` attribute, the browser treats it as an indeterminate progress bar, ensuring correct announcement by assistive technologies.
- Styling the component with `conic-gradient()` to create a visual "trail" and `background-clip: border-area` to hollow out the center into a ring.
- Animating the spinner efficiently using CSS transforms and respecting `prefers-reduced-motion` to ensure a comfortable experience for all users.

See {{ GUIDE_REF("progress-ring") }} for handling determinate tasks with a known duration.


## Implementation

### 1. Markup

Use the native `<progress>` element as both the semantic source of truth and the visual component. Without a `value` attribute, it is implicitly indeterminate.

```html
<progress aria-label="Loading" class="loading-spinner"></progress>
```

### 2. Styles

#### Hiding Native UI
To style the `<progress>` element as a spinner, first hide the default browser styling for indeterminate progress bars.

```css
/* Hide native bars */
progress.loading-spinner:indeterminate::-webkit-progress-bar {
  display: none;
  background: none;
}
progress.loading-spinner:indeterminate::-webkit-progress-value {
  display: none;
  background: none;
}
progress.loading-spinner:indeterminate::-moz-progress-bar {
  display: none;
  background: none;
}
progress.loading-spinner:indeterminate::slider-fill {
  display: none;
  background: none;
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/spinner/guide.md#L1-L59). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
