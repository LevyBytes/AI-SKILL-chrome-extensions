## Fallback strategies

{{ BASELINE_STATUS("view-transitions-element-scoped") }}
{{ BASELINE_STATUS("view-transitions") }}

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

If you really need to have a fallback using `document.startViewTransition()`, you’ll need to make sure that clipping effects of containers are preserved, as detailed in the [Running an outer transition](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/scoped-component-transitions/guide.md#running-an-outer-transition) section. Note that this fallback approach breaks the ability to run multiple view transitions concurrently and will obscure `position: fixed` and `[popover]` elements in the top layer.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/scoped-component-transitions/guide.md#L208-L234). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
