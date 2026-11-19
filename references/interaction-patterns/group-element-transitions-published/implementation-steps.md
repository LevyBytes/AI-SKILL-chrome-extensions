Related section: [Group element transitions](overview.md).
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

Baseline status for View transitions: Newly available. It's been Baseline since 2025-10-14.
Supported by: Chrome 111 (Mar 2023), Edge 111 (Mar 2023), Firefox 144 (Oct 2025), and Safari 18 (Sep 2024).

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

Baseline status for view-transition-class: Newly available. It's been Baseline since 2025-10-14.
Supported by: Chrome 125 (May 2024), Edge 125 (May 2024), Firefox 144 (Oct 2025), and Safari 18.2 (Dec 2024).

Browsers that do not recognize `view-transition-class` or the `::view-transition-group(.class)` selector ignore those CSS rules while still running the DOM update (and any base view transition if supported).

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/group-element-transitions.md#L95-L138). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
