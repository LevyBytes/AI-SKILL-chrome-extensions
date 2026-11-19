### Step 4: Use Media Queries for Responsive Render Blocking

Different viewport sizes may show different amounts of content above the fold. Use the `media` attribute on `<link rel="expect">` to block rendering only for the content visible at a given viewport width.

```html
<head>
  <!--
    DO: Use media queries to conditionally block rendering.
    On wide screens, both the hero and the sidebar are visible,
    so block until both are parsed. On narrow screens, only the
    hero is visible initially.
  -->
  <link
    rel="expect"
    href="#hero"
    blocking="render"
    media="screen and (width <= 768px)"
  >
  <link
    rel="expect"
    href="#sidebar"
    blocking="render"
    media="screen and (width > 768px)"
  >
</head>
```

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


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/consistent-cross-document-transitions/guide.md#L160-L253). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
