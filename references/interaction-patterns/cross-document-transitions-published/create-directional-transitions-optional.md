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

Baseline status for View transitions: Newly available. It's been Baseline since 2025-10-14.
Supported by: Chrome 111 (Mar 2023), Edge 111 (Mar 2023), Firefox 144 (Oct 2025), and Safari 18 (Sep 2024).

Browser support for Cross-document view transitions: Limited availability.
Supported by: Chrome 126 (Jun 2024), Edge 126 (Jun 2024), and Safari 18.2 (Dec 2024).
Unsupported in: Firefox.

If a browser does not support view transitions, or cross-document view transitions, it will perform a standard instant page navigation. Cross-document view transitions are a progressive enhancement; the core functionality of the site remains unaffected.

To check for support in JavaScript:

```javascript
if ('onpagereveal' in window) {
  // Browser supports cross-document view transitions
}
```

Baseline status for Navigation API: Newly available. It's been Baseline since 2026-01-13.
Supported by: Chrome 102 (May 2022), Edge 102 (May 2022), Firefox 147 (Jan 2026), and Safari 26.2 (Dec 2025).

If a browser does not support the Navigation API, you will not be able to use it to determine a transition type. Use an alternate method for determining the transition type, or provide a fallback transition type. Otherwise, the browser will perform a standard instant page navigation.

To check for support in JavaScript:

```javascript
if (window.navigation?.activation) {
  // Browser supports the Navigation API
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/cross-document-transitions.md#L48-L129). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
