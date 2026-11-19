Related section: [Animate to intrinsic sizes](overview.md).
## Example: Transition from Intrinsic to Fixed

You can also animate in the opposite direction—starting from a natural size and collapsing to a specific length. This is useful for "dismissible" components.

```css
.collapsible-alert {
  /* 1. Start with the natural content height */
  block-size: auto;
  overflow: hidden;
  transition: block-size 0.5s ease-in-out, opacity 0.5s ease;
}

.collapsible-alert.is-dismissed {
  /* 2. Smoothly collapse to zero */
  block-size: 0;
  opacity: 0;
  pointer-events: none;
}

/* MANDATORY Copy-Paste Safety: Disable sizing animations for sensitive users */
@media (prefers-reduced-motion: reduce) {
  .expandable-container,
  .badge,
  .collapsible-alert {
    transition: none !important;
  }
}
```

```javascript
// MANDATORY Accessibility Synchronization: Ensure elements collapsed to zero dimensions are removed from the assistive technology tree, and sync aria-expanded states on triggers.
const alertElement = document.querySelector('.collapsible-alert');
function dismissAlert() {
  alertElement.classList.add('is-dismissed');
  // Waits for the transitions the class starts, ignoring any other animations
  // on the element; under reduced motion there are none
  const transitions = alertElement.getAnimations().filter((animation) => animation instanceof CSSTransition);
  Promise.allSettled(transitions.map((transition) => transition.finished)).then(() => {
    if (alertElement.classList.contains('is-dismissed')) {
      alertElement.hidden = true;
    }
  });
}

// Example trigger syncer
const triggerBtn = document.querySelector('.accordion-trigger');
triggerBtn?.addEventListener('click', () => {
  const isExpanded = triggerBtn.getAttribute('aria-expanded') === 'true';
  triggerBtn.setAttribute('aria-expanded', !isExpanded);
});
```

## Key constraints

*   **Keyword-to-Keyword Restriction**: You cannot animate between two different keywords directly (e.g., from `min-content` to `max-content`). One end of the transition must be a fixed length or percentage (e.g., `0` to `auto`).
*   **Calc-size Syntax**: Inside `calc-size()`, you cannot mix different intrinsic keywords in the same expression. The first argument (the basis) defines what `size` represents.
*   **Opt-in Requirement**: Transitions to intrinsic keywords are disabled by default (`numeric-only`) to maintain backward compatibility. You must apply `interpolate-size: allow-keywords` to the element or an ancestor. `calc-size()` acts as a per-property override, automatically enabling interpolation whenever it is used.

## Fallback strategies

Browser support for interpolate-size: Limited availability.
Supported by: Chrome 129 (Sep 2024) and Edge 129 (Sep 2024).
Unsupported in: Firefox and Safari.

Browser support for calc-size(): Limited availability.
Supported by: Chrome 129 (Sep 2024) and Edge 129 (Sep 2024).
Unsupported in: Firefox and Safari.

`interpolate-size` and `calc-size()` are progressive enhancements. Browsers that do not support them will perform an instant jump to the target size.

*   **Graceful Degradation**: For simple `block-size: auto` transitions, standard browsers will simply toggle the size instantly, which is functional but less polished.
*   **Manual keyword fallbacks**: When using `calc-size()`, always provide a standard keyword fallback for older browsers, as they will discard the entire `calc-size()` declaration.

```css
.card {
  block-size: auto; /* Fallback for older browsers */
  block-size: calc-size(auto, size); /* Modern browsers use this */
  transition: block-size 0.3s ease;
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/css/animate-to-intrinsic-sizes.md#L55-L134). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
