Related section: [Directional navigation transitions](overview.md).
### Accessibility

Always respect user preferences for reduced motion by disabling or simplifying animations.

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(root) {
    animation: none !important;
  }
}
```

### Fallback strategies

{{ BASELINE_STATUS("view-transitions") }}
{{ BASELINE_STATUS("active-view-transition") }}

The View Transitions API is a progressive enhancement. In unsupported browsers, `document.startViewTransition` will be `undefined`. You must wrap your navigation logic in a feature detection check to ensure the DOM update still occurs immediately without animation, as shown in this helper function.

```javascript
/**
 * Navigates to a new view with a directional transition.
 * @param {Function} updateDOM - Callback to update the DOM state.
 * @param {string} direction - Either 'forward' or 'backward'.
 */
function navigate(updateDOM, direction) {
  // Feature detect for browsers that do not support View Transitions
  if (!document.startViewTransition) {
    updateDOM();
    return;
  }

  // Start transition with the specific navigation type
  document.startViewTransition({
    update: updateDOM,
    types: [direction] // Matches the CSS :active-view-transition-type() selectors
  });
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/directional-navigation-transitions/guide.md#L95-L133). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
