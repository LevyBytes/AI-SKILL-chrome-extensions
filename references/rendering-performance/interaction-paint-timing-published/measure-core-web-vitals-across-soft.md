### 3. Measure Core Web Vitals across soft navigations with `web-vitals`

If your goal is to report standard Core Web Vitals (LCP, CLS, and INP) across both hard and soft navigations to an analytics endpoint, use the `web-vitals` library (v6.0.0+) with `{ reportSoftNavs: true }` rather than manually slicing every metric timeline.

```javascript
import { onLCP, onFCP, onCLS, onINP } from 'web-vitals';

function sendToAnalytics(metric) {
  // Example-only endpoint; replace with your real telemetry URL.
  navigator.sendBeacon(
    '/analytics',
    JSON.stringify({
      name: metric.name,
      value: metric.value,
      navigationType: metric.navigationType,
      navigationURL: metric.navigationURL,
    }),
  );
}

// Pass { reportSoftNavs: true } to report metrics per soft navigation in addition
// to the initial hard navigation.
onLCP(sendToAnalytics, { reportSoftNavs: true });
onFCP(sendToAnalytics, { reportSoftNavs: true });
onCLS(sendToAnalytics, { reportSoftNavs: true });
onINP(sendToAnalytics, { reportSoftNavs: true });
```

## Best practices

- **DO** feature-detect `'interaction-contentful-paint'` and `'soft-navigation'` using `PerformanceObserver.supportedEntryTypes?.includes(...)` before calling `observer.observe()`.
- **DO** pass `{ buffered: true }` when observing `'interaction-contentful-paint'` and `'soft-navigation'` so early entries are not missed if analytics code initializes asynchronously.
- **DO** call `softNavEntry.getLargestInteractionContentfulPaint()` when handling a new `soft-navigation` entry so paints that occurred prior to the URL update are included in LCP.
- **DO** match `interaction-contentful-paint` entries to a soft navigation using `interactionId`, not `navigationId`.
- **DO** use `entry.duration` (or `entry.presentationTime - entry.startTime`) to measure interaction paint latency, rather than reporting `entry.presentationTime` directly. All `PerformanceEntry` timestamps are measured from the initial hard page load time origin, not from the soft navigation start.
- **DO NOT** rely on `performance.getEntriesByType('soft-navigation')` to monitor long-lived single-page applications, as the browser's buffer is limited to the first 50 soft navigation entries.

## Fallback strategies

Browser support for Interaction contentful paint performance entries: Limited availability.
Supported by: Chrome 151 (Jul 2026) and Edge 151 (Jul 2026).
Unsupported in: Firefox and Safari.

Browser support for Soft navigation performance entries: Limited availability.
Supported by: Chrome 151 (Jul 2026) and Edge 151 (Jul 2026).
Unsupported in: Firefox and Safari.

If your Baseline target includes browsers that do not support `InteractionContentfulPaint` or `PerformanceSoftNavigation`, treat these APIs as a progressive enhancement for Real User Monitoring (RUM):

1. **Feature detection and graceful degradation:** Guard observer registration with `PerformanceObserver.supportedEntryTypes?.includes('interaction-contentful-paint')` and `PerformanceObserver.supportedEntryTypes?.includes('soft-navigation')`. In browsers lacking support, skip registering the observers so your application runs without throwing errors.
2. **Keep standard hard-navigation observers active:** Continue observing standard `'largest-contentful-paint'`, `'event'`, and `'layout-shift'` entries across all browsers. Because `LargestContentfulPaint` is finalized on the first user interaction regardless of soft-navigation support, measuring soft navigations in supporting browsers does not alter or break initial hard-load LCP measurements.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/performance/interaction-paint-timing.md#L150-L200). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
