### Step 5: Use pagereveal for Context-Dependent Transitions (Optional)

The `pagereveal` event is **not required** for the core render-blocking strategy. It is only needed when `view-transition-name` values must be assigned dynamically based on where the user navigated from — for example, morphing a specific list item to a detail page heading.

If `view-transition-name` values are assigned statically in CSS, or if you are only using the default full-page cross-fade, skip this step entirely.

```html
<head>
  <!--
    MANDATORY: The pagereveal listener must be registered before
    the page renders. Inline small setup scripts with blocking="render"
    to avoid an extra network round-trip on cold loads, or use an
    external async script with blocking="render" so the listener is
    registered early without blocking HTML parsing.
    If the listener is registered too late (e.g., in a deferred
    script), the event may have already fired.
  -->
  <script async blocking="render" src="/js/transition-setup.js"></script>
</head>
```

```javascript
// transition-setup.js
window.addEventListener('pagereveal', async (event) => {
  if (!event.viewTransition) return;

  const from = navigation.activation?.from;
  if (!from) return;

  const fromUrl = new URL(from.url);

  // DO: Assign view-transition-name based on navigation context.
  // This enables a morph animation from the product card on the
  // list page to the heading on the detail page.
  if (fromUrl.pathname === '/products/') {
    const heading = document.querySelector('main h1');
    if (!heading) return;

    heading.style.viewTransitionName = 'product-title';

    try {
      await event.viewTransition.ready;
    } catch (error) {
      // Skipped view transitions reject `ready` with InvalidStateError.
      if (error.name !== 'InvalidStateError') {
        throw error;
      }
    } finally {
      // MANDATORY: Remove the temporary name after the transition
      // finishes. Stale names interfere with subsequent navigations
      // and prevent the page from entering the bfcache.
      await event.viewTransition.finished;
      heading.style.viewTransitionName = '';
    }
  }
});
```

## Best Practices

- **DO** assign `view-transition-name` via CSS whenever possible. Reserve JavaScript assignment (via `pagereveal`) for cases where the name depends on navigation context.
- **DO** keep render-blocking scripts small and fast. The browser has a built-in timeout (around 4 seconds), after which the transition is skipped entirely (rejecting `viewTransition.ready` with an `InvalidStateError` if a transition was initiated).
- **DO NOT** use `<link rel="expect">` to block on elements deep in the page that are not visible in the initial viewport. This delays the transition without visual benefit.
- **DO NOT** mark analytics, ad-network, tag-manager or other third-party loaders with `blocking="render"`, even if they inject content into the initial viewport. Their network latency counts toward the transition timeout and their output is not part of the page's stable state.
- **DO NOT** assign the same `view-transition-name` to multiple elements on the same page. Duplicate names cause the entire transition to be skipped.
- **Assistive Technology Timing Impact**: Using `blocking="render"` delays visual updates and initial paint. While this prevents visual glitches for sighted users, it can cause processing latency or deferred initialization for screen readers and other assistive technologies that depend on rendered accessibility trees. Weigh the visual continuity benefits against the initial read latency for non-visual users, and ensure render-blocking scripts are minimal and extremely optimized.

## Fallback Strategies

Browser support for Cross-document view transitions: Limited availability.
Supported by: Chrome 126 (Jun 2024), Edge 126 (Jun 2024), and Safari 18.2 (Dec 2024).
Unsupported in: Firefox.

Cross-document view transitions are an excellent candidate for progressive enhancement. In browsers that do not support them, the `@view-transition` rule is ignored and standard same-origin navigations occurs exactly as they would without the feature. Supporting browsers get smooth transitions; all others get standard navigation. Limited browser support is not a reason to avoid adoption.

All browsers that support cross-document view transitions also support `blocking="render"` and `<link rel="expect">`, so no separate fallback is needed for the render-blocking features described in this guide.

## Other Considerations

1. **Performance Impact**: Every render-blocking resource delays the view transition animation start. Minimize the number of render-blocking scripts and use `<link rel="expect">` only for elements that are above the fold. Prerender destination pages using the Speculation Rules API to eliminate loading delays entirely.
2. **Timeout Behavior**: If the combined render-blocking time exceeds approximately 4 seconds, the browser skips the transition (and any active `viewTransition.ready` promise rejects with an `InvalidStateError`). Ensure critical resources load well within this window.
3. **bfcache Compatibility**: Temporary `view-transition-name` assignments that are not cleaned up after the transition can prevent the page from entering the bfcache. Always remove dynamically assigned names in the `finished` callback.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/consistent-cross-document-transitions.md#L178-L259). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
