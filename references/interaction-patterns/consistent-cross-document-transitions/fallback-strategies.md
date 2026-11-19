## Fallback Strategies

{{ BASELINE_STATUS("cross-document-view-transitions") }}

Cross-document view transitions are an excellent candidate for progressive enhancement. In browsers that do not support them, the `@view-transition` rule is ignored and standard same-origin navigations occurs exactly as they would without the feature. Supporting browsers get smooth transitions; all others get standard navigation. Limited browser support is not a reason to avoid adoption.

All browsers that support cross-document view transitions also support `blocking="render"` and `<link rel="expect">`, so no separate fallback is needed for the render-blocking features described in this guide.

## Other Considerations

1. **Performance Impact**: Every render-blocking resource delays the view transition animation start. Minimize the number of render-blocking scripts and use `<link rel="expect">` only for elements that are above the fold. Prerender destination pages using the Speculation Rules API to eliminate loading delays entirely.
2. **Timeout Behavior**: If the combined render-blocking time exceeds approximately 4 seconds, the browser skips the transition (and any active `viewTransition.ready` promise rejects with an `InvalidStateError`). Ensure critical resources load well within this window.
3. **bfcache Compatibility**: Temporary `view-transition-name` assignments that are not cleaned up after the transition can prevent the page from entering the bfcache. Always remove dynamically assigned names in the `finished` callback.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/consistent-cross-document-transitions/guide.md#L254-L266). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
