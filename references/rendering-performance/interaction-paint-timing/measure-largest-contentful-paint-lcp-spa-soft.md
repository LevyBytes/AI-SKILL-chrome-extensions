### 2. Measure Largest Contentful Paint (LCP) for SPA soft navigations

A soft navigation is emitted by the browser when a trusted user interaction causes both a visible URL change and a contentful paint. To calculate LCP for each soft navigation:

1. Observe both `'soft-navigation'` and `'interaction-contentful-paint'` entries with `buffered: true`.
2. **MANDATORY:** When a `'soft-navigation'` entry is received, seed its initial LCP candidate by calling `softNavEntry.getLargestInteractionContentfulPaint()`. If the application painted content *before* updating the URL (for example, rendering a view and then calling `history.pushState()`), those early `interaction-contentful-paint` entries were emitted before the `soft-navigation` entry and still carry the *previous* `navigationId`.
3. **MANDATORY:** Correlate subsequent `'interaction-contentful-paint'` entries to the active soft navigation by matching `entry.interactionId === softNavEntry.interactionId`, **DO NOT** match by `entry.navigationId`. Using `interactionId` ensures you include paints that occurred before the URL update and exclude paints from later, unrelated interactions on the new route.

```javascript
/**
 * Tracks FCP and LCP for each client-side soft navigation and reports finalized
 * route metrics when the user navigates to a new route or hides the page.
 *
 * @param {(report: {
 *   url: string,
 *   navigationId: number,
 *   interactionId: number,
 *   fcpDuration: number,
 *   lcpDuration: number | null,
 *   lcpElement: Element | null,
 *   lcpSize: number | null
 * }) => void} onSoftNavReport
 */
export function trackSoftNavigationLCP(onSoftNavReport) {
  const supported =
    typeof PerformanceObserver !== 'undefined' &&
    PerformanceObserver.supportedEntryTypes?.includes('soft-navigation') &&
    PerformanceObserver.supportedEntryTypes?.includes('interaction-contentful-paint');

  if (!supported) {
    return null;
  }

  let activeSoftNav = null;
  let activeLcpEntry = null;

  function finalizeCurrentSoftNav() {
    if (!activeSoftNav) return;

    onSoftNavReport({
      // activeSoftNav.name holds the destination URL of the soft navigation.
      url: activeSoftNav.name,
      navigationId: activeSoftNav.navigationId,
      interactionId: activeSoftNav.interactionId,
      // activeSoftNav.duration is (activeSoftNav.presentationTime - activeSoftNav.startTime),
      // which represents First Contentful Paint (FCP) relative to interaction start.
      fcpDuration: activeSoftNav.duration,
      // activeLcpEntry.duration is (activeLcpEntry.presentationTime - activeSoftNav.startTime),
      // representing the soft navigation's LCP duration relative to interaction start.
      lcpDuration: activeLcpEntry ? activeLcpEntry.duration : null,
      lcpElement: activeLcpEntry?.largestContentfulPaint?.element ?? null,
      lcpSize: activeLcpEntry?.largestContentfulPaint?.size ?? null,
    });

    activeSoftNav = null;
    activeLcpEntry = null;
  }

  const softNavObserver = new PerformanceObserver((list) => {
    for (const softNavEntry of list.getEntries()) {
      // Finalize the previous route's metrics before resetting state for the new route.
      finalizeCurrentSoftNav();

      activeSoftNav = softNavEntry;
      // MANDATORY: Seed the LCP candidate with getLargestInteractionContentfulPaint()
      // to capture any attributed contentful paints that occurred before the URL updated.
      activeLcpEntry = softNavEntry.getLargestInteractionContentfulPaint();
    }
  });

  const icpObserver = new PerformanceObserver((list) => {
    for (const icpEntry of list.getEntries()) {
      // MANDATORY: Match by interactionId (not navigationId) so only paints caused
      // by the soft navigation's initiating interaction update the route's LCP.
      if (activeSoftNav && icpEntry.interactionId === activeSoftNav.interactionId) {
        activeLcpEntry = icpEntry;
      }
    }
  });

  softNavObserver.observe({ type: 'soft-navigation', buffered: true });
  icpObserver.observe({ type: 'interaction-contentful-paint', buffered: true });

  // Finalize the active route's LCP when the page is backgrounded or unloaded.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      finalizeCurrentSoftNav();
    }
  });

  return { softNavObserver, icpObserver, finalizeCurrentSoftNav };
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/interaction-paint-timing/guide.md#L64-L157). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
