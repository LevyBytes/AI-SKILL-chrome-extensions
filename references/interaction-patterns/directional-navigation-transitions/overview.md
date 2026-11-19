Related section: [Accessibility](accessibility.md).
```yaml
---
name: directional-navigation-transitions
description: Animate visual state changes to reflect the direction of a user's navigational flow, such as sliding new content in from the right when advancing forward or from the left when returning to a previous screen.
web-feature-ids:
  - view-transitions
  - active-view-transition
---
```

# Directional Navigation Transitions

Single Page Applications (SPAs) provide the appearance of navigation by replacing the content of the page without navigating to a new page. By default, the content is simply replaced, without any transitions. Directional transitions can visually reinforce a spatial relationship between views. 

By sliding new content in from the direction the user is moving you create a mental map of the application structure. For instance, a product site may show a transition to the right for "forward," and to the left for "back", or a slideshow may transition up and down to show next and previous slides.

### Implementation Steps

1. **Detect Navigation Direction**: Determine if the user is moving "forward" or "backward" in the application flow. How you detect the direction depends on your use case.
2. **Trigger Transition with Types**: Pass the direction in a `types` array to `document.startViewTransition()` to categorize the transition.
3. **Define Directional Animations with CSS**: Use the `:active-view-transition-type()` pseudo-class to apply specific animations based on the navigation type.

### Defining Keyframes

Define sliding animations to and from each direction. For best performance, animate position changes using the `transform` property or the individual transform properties, `scale`, `rotate`, and `translate`. `opacity` is generally performant as well, but avoid animating other CSS properties without first verifying that they don't trigger layout or painting.

```css
/* Slide an element out to the left */
@keyframes slide-to-left {
  /* Mandatory: animate `transform` instead of inset properties for better performance. */
  to { transform: translateX(-100%); }
}

/* Slide an element in from the right */
@keyframes slide-from-right {
  from { transform: translateX(100%); }
}

/* Slide an element out to the right */
@keyframes slide-to-right {
  to { transform: translateX(100%); }
}

/* Slide an element in from the left */
@keyframes slide-from-left {
  from { transform: translateX(-100%); }
}
```

### Set up shared animation settings

Use the `::view-transition-group(root)` selector to apply animation settings that are shared across all transitions. The transition group must use a non-linear timing function (such as an `ease` keyword or `cubic-bezier()`) rather than `linear`, which makes directional slide transitions feel mechanical and abrupt.

```css
::view-transition-group(root){
  animation: 0.4s ease-in-out both;
}
```

### Applying Directional Animations

Use the `active-view-transition-type` pseudo-class to target the transition views specifically when the "forward" or "backward" type is active.

```css
/* MANDATORY: Apply forward animations when the 'forward' type is active */
html:active-view-transition-type(forward)::view-transition-old(root) {
  animation-name: slide-to-left;
}
html:active-view-transition-type(forward)::view-transition-new(root) {
  animation-name: slide-from-right;
}

/* MANDATORY: Apply backward animations when the 'backward' type is active */
html:active-view-transition-type(backward)::view-transition-old(root) {
  animation-name: slide-to-right;
}
html:active-view-transition-type(backward)::view-transition-new(root) {
  animation-name: slide-from-left;
}
```

### Triggering the Transition

When navigating, pass the appropriate type to the `startViewTransition` method.

```javascript
const transitionType = yourTransitionTypeLogic();
const updateDOM = yourUpdateDOMLogic();

document.startViewTransition({
  update: updateDOM,
  types: [transitionType] // Matches the CSS :active-view-transition-type() selectors
});
```



GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/directional-navigation-transitions/guide.md#L1-L94). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
