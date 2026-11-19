Related section: [Cross document transitions](overview.md).
#### 3. Create Directional Transitions (Optional)

You may want different transition effects depending on the pages you are navigating between. For instance, when navigating from a home page to a contact page, you may want the effect of new content coming from the right. When navigating back to the home page, it wouldn't make sense to have the same effect. 

If the page you are navigating to will always have the same transition type, regardless of how you get to the page, you can specify it with `types` in the `@view-transition` rule.

```css
@media (prefers-reduced-motion: no-preference) {
  @view-transition {
    navigation: auto;
    /* Specify the types of view transitions that will always be used on this page. */
    types: previous;
  }
}
```

You can also conditionally specify transition types inside of an event listener for `pagereveal`.

```js
window.addEventListener("pagereveal", async (e) => {
  if (e.viewTransition && window.navigation?.activation) {
    // Use application-specific logic to compute a transition type
     const transitionType = yourTransitionTypeLogic(navigation.activation.from, navigation.activation.entry);
    e.viewTransition.types.add(transitionType);
  }
});
```

Then, use the `:active-view-transition-type()` pseudo selector to apply the different animations for each type.

```css
:active-view-transition-type(next) {
  &::view-transition-old(root) {
    animation-name: slide-out-next;
  }

  &::view-transition-new(root) {
    animation-name: slide-in-next;
  }
}
:active-view-transition-type(previous) {
  &::view-transition-old(root) {
    animation-name: slide-out-previous;
  }

  &::view-transition-new(root) {
    animation-name: slide-in-previous;
  }
}
```

### Fallback strategies

{{ BASELINE_STATUS("view-transitions") }}

{{ BASELINE_STATUS("cross-document-view-transitions") }}

If a browser does not support view transitions, or cross-document view transitions, it will perform a standard instant page navigation. Cross-document view transitions are a progressive enhancement; the core functionality of the site remains unaffected.

To check for support in JavaScript:

```javascript
if ('onpagereveal' in window) {
  // Browser supports cross-document view transitions
}
```

{{ BASELINE_STATUS("navigation") }}

If a browser does not support the Navigation API, you will not be able to use it to determine a transition type. Use an alternate method for determining the transition type, or provide a fallback transition type. Otherwise, the browser will perform a standard instant page navigation.

To check for support in JavaScript:

```javascript
if (window.navigation?.activation) {
  // Browser supports the Navigation API
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/cross-document-transitions/guide.md#L57-L134). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
