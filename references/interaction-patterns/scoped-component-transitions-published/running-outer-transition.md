## Running an outer transition

When starting a view transition outside of the intended scope (e.g. from a parent component, or from the document for a page-level transition), the outer transition will capture and animate the scope element and everything inside it.

To prevent this from happening, wrap the scope element in a separate wrapper element with its own `view-transition-name`, and apply `view-transition-scope: all` to the inner scope element. This allows the wrapper itself to be captured and animated by the outer transition while preventing the inner scope's contents from being captured.

```html
<div class="page" id="page">
  <div class="card-wrapper">
    <section class="card" id="left">
      <h2>Card A</h2>
      <ul id="left-list">
        <li>…</li>
      </ul>
    </section>
  </div>
  <div class="card-wrapper">
    <section class="card" id="right">
      <h2>Card B</h2>
      <ul id="right-list">
        <li>…</li>
      </ul>
    </section>
  </div>
</div>
```

```javascript
document.querySelector('#page').startViewTransition(() => {
  // do your DOM updates here...
});
```

```css
/* Apply a view-transition-name on the wrapper */
.card-wrapper {
  view-transition-name: match-element;
}

/* Prevent the contents of the card being captured by an outer transition */
.card {
  view-transition-scope: all;
}

.card ul li {
  view-transition-name: match-element;
}
```

Alternatively, you can allow the outer transition to capture the children. In order to retain clipping effects, resort to using Nested View Transition Groups to clip the captured children at the boundaries of their wrapper. In that case, though, you need to manually apply the `clip` onto the resulting `::view-transition-group-children()` pseudo.

```css
.card-wrapper {
  overflow: clip;
  view-transition-name: match-element; /* Capture me as part of the outer VT */
  view-transition-group: contain; /* Nest children that also have a view-transition-name */
  view-transition-class: card; /* For targeting purposes */
}

/* Manually copy back the clip onto the ::view-transition-group-children pseudo */
::view-transition-group-children(.card) {
  overflow: clip;
}

.card ul li {
  view-transition-name: match-element;
}
```

## Constraints & Accessibility

- **MANDATORY**: Call `startViewTransition()` on the component root element rather than `document` so external `position: fixed` elements and `[popover]` overlays remain layered on top and the rest of the page stays interactive.
- **MANDATORY**: Preserve and move existing DOM nodes (rather than recreating them with `innerHTML`) when using `view-transition-name: match-element`, as `match-element` tracks DOM node identity.
- **MANDATORY**: Respect user preferences for reduced motion using `@media (prefers-reduced-motion: reduce)` by setting `animation: none !important` on `::view-transition-group(*)`, `::view-transition-old(*)`, and `::view-transition-new(*)`.
- **MANDATORY**: Preserve keyboard focus when removing a focused element during a transition by shifting focus to an adjacent item or control inside the update callback.
- **DO**: Use Nested View Transition Groups (`view-transition-group: contain` and `overflow: clip` on `::view-transition-group-children()`) when a captured element inside the scope clips its own overflow and contains nested captured elements.
- **DO**: Attach `transition.ready.catch(() => {})` when rapid interactions can re-trigger `element.startViewTransition()` on the same scope element.
- **DO**: Wrap an inner scope element in a separate named wrapper element if an outer transition needs to animate the component's position while an inner transition is running.
- **DO NOT**: Set `view-transition-name: none` on a scope element that clips its overflow (`overflow: hidden`, `scroll`, or `clip`) or changes its own geometry, as opting out of self-participation disables automatic overflow clipping.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/scoped-component-transitions.md#L120-L199). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
