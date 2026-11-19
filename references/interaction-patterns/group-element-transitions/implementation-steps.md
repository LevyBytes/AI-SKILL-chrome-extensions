Related section: [Group element transitions](overview.md).
4. **Trigger the transition**

   Wrap the DOM update in `document.startViewTransition()`. The browser will capture the old state, perform the update, and then animate to the new state.

   ```javascript
   function updateList(newData) {
     document.startViewTransition(() => {
       // All DOM changes inside this callback will be transitioned
       render(newData);
     });
   }
   ```

5. **Maintain interactivity of non-transitioned elements**

   View transitions work by overlaying snapshots of the DOM elements, and then transitioning the snapshots. This means that during the transition, elements are not interactive. If there are interactive elements that are not transitioned, you can make them interactive by disabling pointer events on the view transitions.

   ```css
   ::view-transition {
     /* Non-transitioned elements below the view transitions remain interactive */
     pointer-events: none;
   }
   ```

   In addition, by default, the `:root` element has a view transition named `root`, which enables default full-page transitions. If there are no changes to the root element, this will be a transition between two identical snapshots, which are not interactive. Because we are only transitioning specific elements, and not the entire screen, we can disable the `root` transition.

   ```css
   :root {
     /* Disable the root transition because we are only transitioning specific elements. */
     view-transition-name: none;
   }
   ```

## Fallback strategies

### View transitions

{{ BASELINE_STATUS("view-transitions") }}

View Transitions are a progressive enhancement. If the browser does not support `document.startViewTransition`, run the DOM update immediately to provide a functional, non-animated experience:

```javascript
if (document.startViewTransition) {
  document.startViewTransition(() => updateDOM());
} else {
  // Fallback: Perform the update without animation
  updateDOM();
}
```

### `view-transition-class`

{{ BASELINE_STATUS("view-transition-class") }}

Browsers that do not recognize `view-transition-class` or the `::view-transition-group(.class)` selector ignore those CSS rules while still running the DOM update (and any base view transition if supported).

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/group-element-transitions/guide.md#L90-L144). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
