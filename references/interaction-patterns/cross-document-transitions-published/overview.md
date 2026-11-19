Related section: [3. Create Directional Transitions (Optional)](create-directional-transitions-optional.md).
# Cross-Document Transitions

Cross-document view transitions allow you to create smooth, app-like transitions between different pages of a Multi-Page Application (MPA). By default, the browser performs a cross-fade, but you can customize this to match your site's aesthetic.

### Implementation Steps

#### 1. Opt-in to Cross-Document View Transitions

Both the source and destination pages must opt-in to view transitions for the browser to trigger them on navigation.

```css
/* Respect user's preference for reduced motion */
@media (prefers-reduced-motion: no-preference) {
  /* Add to a global stylesheet shared by both pages */
  @view-transition {
    /* Enables transitions for same-origin navigations */
    navigation: auto;
  }
}
```

#### 2. Customize Transition Animations (Optional)

You can target the old and new states of the transition using pseudo-elements to create effects like slides or reveals.

```css
/* Customizing the outgoing page animation */
::view-transition-old(root) {
  /* Move the old page out to the left */
  animation: 0.4s ease-in both slide-out;
}

/* Customizing the incoming page animation */
::view-transition-new(root) {
  /* Move the new page in from the right */
  animation: 0.4s ease-out both slide-in;
}

@keyframes slide-out {
  to { transform: translateX(-20%); opacity: 0; }
}

@keyframes slide-in {
  from { transform: translateX(100%); }
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/cross-document-transitions.md#L1-L47). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
