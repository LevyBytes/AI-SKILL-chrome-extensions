#### Scroll snap events

{{ BASELINE_STATUS("scroll-snap-events") }}

The `scrollsnapchange` event is the cleanest way to detect "the active view changed" — one listener on the stack, fired exactly once per snap commit. In browsers without it, the same effect can be polyfilled with an `IntersectionObserver` watching each view for full visibility inside the stack. The fallback dispatches into the same `onActiveViewChanged` function the primary path uses, so all the state-transition logic stays in one place.

```js
// MANDATORY when supporting browsers that haven't shipped scroll-snap-events
// yet. Check `HTMLElement.prototype` (not `window` or `document`) — the
// event handler IDL attribute is added to the prototype when the feature
// is supported, regardless of whether any element has the handler set.
if (!('onscrollsnapchange' in HTMLElement.prototype)) {
  const viewObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      // threshold:1 only fires for fully-visible entries, but the
      // observer also emits a "leaving" entry per view that drops below
      // ratio 1. Filter to the entering side, which is the snap-commit
      // moment we're trying to detect.
      if (entry.intersectionRatio === 1) {
        onActiveViewChanged(entry.target);
      }
    }
  }, {root: stack, threshold: 1});

  // Auto-observe every .Stack-view as it's added to the stack, and stop
  // observing as it's removed. Using a MutationObserver lets the primary
  // code (drillDown, updateFromHistoryState, synthesizeRootEntry, init)
  // stay free of fallback wiring.
  new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.classList?.contains('Stack-view')) viewObserver.observe(node);
      }
      for (const node of m.removedNodes) {
        if (node.classList?.contains('Stack-view')) viewObserver.unobserve(node);
      }
    }
  }).observe(stack, {childList: true});

  // Catch up to any views already in the stack at the time this code
  // runs (typically the initial view appended in step 8).
  for (const view of stack.children) viewObserver.observe(view);
}
```

#### Scroll-driven animations

{{ BASELINE_STATUS("scroll-driven-animations") }}

The scroll-driven parallax / dim / shadow effect is a progressive enhancement on top of the navigation core. The CSS `@supports (animation-timeline: view())` gate (shown in step 2) confines the animation to supporting browsers; everywhere else the views simply cut between snap stops with no transition. The component is fully functional without the parallax — snap, history sync, focus management, and `inert` all still work.

If a parallax fallback is required for older baseline targets, attach a `scroll` listener to the stack and write a CSS custom property describing each view's progress through the scrollport, then drive `transform` and `filter` from that property:

```js
if (!CSS.supports('animation-timeline: view()')) {
  stack.addEventListener('scroll', () => {
    const viewWidth = stack.clientWidth;
    for (const view of stack.children) {
      // Progress: 0 when this view is centered, 1 when it has fully
      // exited to the left. Matches the @keyframes mapping above.
      const offsetLeft = view.offsetLeft - stack.scrollLeft;
      const progress = Math.min(1, Math.max(0, -offsetLeft / viewWidth));
      const content = view.querySelector('.Stack-viewContent');
      content.style.transform = `translateX(${progress * 75}%)`;
      content.style.filter = `brightness(${1 - progress * 0.2})`;
    }
  });
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/stack-drill-down/guide.md#L669-L737). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
