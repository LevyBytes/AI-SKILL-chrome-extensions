### 8. Initialization (including deep links)

When the page loads, the URL may already point at a deep view (a shared link, a bookmark, a refresh on a deep page). Build whichever initial view matches the URL — root or deep-linked, but never both — append it to the empty stack, seed the depth-0 history entry, and run an initial scroll pass with `behavior: 'instant'` so the parallax doesn't animate on first paint.

```js
const initialUrlPath = getCurrentUrlPath();
const initialRouteData = resolveUrl(initialUrlPath);

// Build the initial view: a drill-down view if the URL maps to one,
// otherwise the root view. Whichever it is, that's the only view in
// the stack right now — the other will be created lazily by
// synthesizeRootEntry (step 5) or drillDown (step 4) if the user
// navigates to it.
let initialView;
if (initialRouteData) {
  initialView = createDrillDownView(initialRouteData);
} else {
  rootView = createRootView();
  initialView = rootView;
}
stack.appendChild(initialView);

entriesByDepth.set(0, {urlPath: initialUrlPath, view: initialView});
// replaceState attaches a `depth` to the entry the user landed on, so
// any subsequent pushState / popstate has a base depth to count from.
history.replaceState({depth: 0}, '');

updateFromHistoryState(history.state, 'instant');
```

### Best practices

- **DO** use the `scrollsnapchange` event (with an `IntersectionObserver` fallback — see "Fallback strategies") as the source of truth for "the active view changed", not scroll-event coordinates. Snap commit is the only event that fires consistently across swipe, click, programmatic scroll, and `popstate` paths.
- **DO** apply transforms to a child of the snap target, never to the snap target itself. A transform on the snap target feeds back into the scroll container's snap geometry and the scroller will glitch mid-gesture.
- **DO** apply `inert` to every view except the currently visible one. Without this, focus and screen-reader navigation leak into views hidden behind the parallax — invisible to sighted users but a severe accessibility failure.
- **DO** push a history entry on every drill-down and handle `popstate` so the OS-level Back gesture and the browser back/forward buttons work. This is what makes the pattern feel like a native app.
- **DO** reconcile history from the active-view-changed handler when a swipe-back lands on a view whose depth doesn't match `currentDepth`. Without this, a subsequent OS Back returns the user somewhere unexpected because the browser's history cursor is out of sync with what's on screen.
- **DO** prune views the user swiped past from the DOM. A long drill-down session can otherwise accumulate dozens of detached subtrees. The cached URL path in `entriesByDepth` is enough to rebuild any view if forward navigation returns to it.
- **DO** make sure focus ends up inside the active view after every active-view change, including Back from a deep link and jumps to the root. If there is no stored link and no back button, focus the view's `.Stack-viewContent` (given `tabindex="-1"`). Focus left in a removed or `inert` view falls to `<body>`.
- **DO** update `document.title` to name the active view on every active-view change. Each drill-down adds a history entry, and the title is what the browser's history list, the tab and screen readers use to tell those entries apart.
- **DO** call `.focus({preventScroll: true})` when restoring focus inside the stack. The default `preventScroll: false` makes the browser scroll the focus target into view, which fights the snap container and can land the user mid-snap.
- **DO** preserve cmd/ctrl/middle-click on internal links so URLs remain shareable and openable in a new tab.
- **DO** use `behavior: 'instant'` for multi-step history jumps AND for spatial-forward popstate transitions (`toIdx > fromIdx`). Multi-step jumps would otherwise fire `scrollsnapchange` at every intermediate snap and do N rounds of inert/focus/history work. Forward popstates are often spurious — iOS Safari treats edge swipes as browser forward even with `overscroll-behavior-x: none` set, and an instant swap is much less misleading than animating a "drilldown" the user didn't initiate. The user-initiated drill-down path (`drillDown`) is unaffected because it scrolls directly, not via `popstate`.
- **DO** respect `prefers-reduced-motion`: declare `scroll-behavior: smooth` only inside `@media (prefers-reduced-motion: no-preference)` and call `scrollTo` / `scrollBy` with `behavior: 'auto'` (not `'smooth'`) so the OS-level preference takes effect without per-call JS branching. Hard-coding `behavior: 'smooth'` bypasses the user's setting.
- **DO** render real `<a href>` elements as drill-down triggers, not `<button onclick>` or `<div>`. Real anchors get URL preview on hover, shareability, middle-click, screen-reader role, and SEO for free.
- **DO** include an explicit back button in every drill-down view. The swipe gesture is not discoverable or available to all users — keyboard, pointer, and desktop users need a visible affordance. Horizontal arrow keys and trackpad swipes can also scroll the stack.
- **DO NOT** call `history.pushState` from the `popstate` handler — that pushes *new* entries while the user is trying to go back and breaks the browser back button.
- **DO NOT** drive the parallax with a `scroll` event listener when scroll-driven animations are available. The CSS path runs on the compositor; a JS scroll listener runs on the main thread and will visibly drop frames during the gesture.
- **DO NOT** mutate views you removed from the DOM after a swipe-back. Treat `entriesByDepth` as the canonical record: a pruned entry has `view: null` and is rebuilt on demand in `updateFromHistoryState`.

### Fallback strategies

{{ BASELINE_STATUS("scroll-snap") }}

{{ BASELINE_STATUS("intersection-observer") }}

{{ BASELINE_STATUS("inert") }}

The features that may require fallbacks are scroll-snap-events and scroll-driven-animations, both of which have robust fallback or progressive enhancement stories, and are safe to use for this use case:


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/stack-drill-down/guide.md#L609-L668). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
