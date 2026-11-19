## Fallback strategies

Browser support for Element-scoped view transitions: Limited availability.
Supported by: Chrome 147 (Apr 2026) and Edge 147 (Apr 2026).
Unsupported in: Firefox and Safari.

Baseline status for View transitions: Newly available. It's been Baseline since 2025-10-14.
Supported by: Chrome 111 (Mar 2023), Edge 111 (Mar 2023), Firefox 144 (Oct 2025), and Safari 18 (Sep 2024).

If your Baseline target does not support element-scoped view transitions, degrade gracefully by running the DOM update callback immediately without animation. While you could fall back to `document.startViewTransition()` this is not recommended for isolated component updates, as a document-scoped transition blocks concurrent component transitions and obscures `position: fixed` and `[popover]` elements in the top layer.

```javascript
// Feature detect specifically on Element.prototype (not document.startViewTransition)
const supportsScopedTransition = 'startViewTransition' in Element.prototype;

function runWithTransition(scopeEl, updateDOM) {
  if (!supportsScopedTransition) {
    // Fallback: apply the DOM update immediately without animation
    updateDOM();
    return;
  }

  const transition = scopeEl.startViewTransition(() => {
    updateDOM();
  });

  transition.ready.catch(() => {});
}
```

If you really need to have a fallback using `document.startViewTransition()`, you’ll need to make sure that clipping effects of containers are preserved, as detailed in the [Running an outer transition](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/scoped-component-transitions.md#running-an-outer-transition) section. Note that this fallback approach breaks the ability to run multiple view transitions concurrently and will obscure `position: fixed` and `[popover]` elements in the top layer.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/scoped-component-transitions.md#L200-L230). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
