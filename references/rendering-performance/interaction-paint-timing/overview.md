```yaml
---
name: interaction-paint-timing
description: Measure the time it takes for user interactions and client-side navigations to render new contentful updates on screen.
web-feature-ids:
  - interaction-contentful-paint
  - soft-navigations
---
```

# Measure interaction and soft-navigation paint timing

Standard paint and responsiveness metrics leave a measurement gap after the initial page load:

- **`LargestContentfulPaint` (`largest-contentful-paint`)** only measures the initial ("hard") document load and stops emitting entries as soon as the user first interacts with the page.
- **`PerformanceEventTiming` and `event` / Interaction to Next Paint (INP)** measures input responsiveness up to the *very next frame* (such as a button active state or loading spinner), but does not track subsequent asynchronous paints—such as new content rendered after a `fetch()` resolves, or a client-side route transition completes.
- Observing route changes in a Single Page App (SPA) can be difficult outside of framework code. Just monitoring URL updates can over report URL changes that are not linked to route changes (for example, anchor link changes, multiple "redirects" for a single route change).

The `InteractionContentfulPaint` (`interaction-contentful-paint`) and `PerformanceSoftNavigation` (`soft-navigation`) performance entry types fill this gap. They propagate interaction causality across asynchronous tasks (`fetch`, `await`, `setTimeout`) to attribute new contentful paints and Single-Page Application (SPA) route transitions directly back to the user interaction that triggered them.

## How to implement

### 1. Observe contentful paints triggered by interactions

Use a `PerformanceObserver` with `type: 'interaction-contentful-paint'` and `buffered: true` to observe progressively larger contentful paints attributable to any user interaction.

Each `InteractionContentfulPaint` entry provides:
- `interactionId`: The unique identifier of the initiating user interaction (matching `PerformanceEventTiming.interactionId` and `PerformanceSoftNavigation.interactionId`).
- `startTime`: The timestamp when the initiating user interaction started, relative to the initial hard navigation time origin.
- `paintTime` and `presentationTime`: When the rendering phase ended and when the painted pixels were drawn on screen.
- `duration`: The elapsed time from interaction start to paint presentation (`presentationTime - startTime`).
- `largestContentfulPaint`: A snapshot `LargestContentfulPaint` object containing details about the largest painted element for that interaction so far (`element`, `size`, `url`, `id`, `renderTime`, `loadTime`).

```javascript
/**
 * Observes contentful paints caused by user interactions and invokes a callback
 * whenever an interaction produces a larger contentful paint.
 *
 * @param {(entry: PerformanceEntry) => void} onInteractionPaint
 */
export function observeInteractionPaints(onInteractionPaint) {
  // Feature-detect support before calling observe() so unsupported browsers
  // do not throw or log console warnings.
  if (
    typeof PerformanceObserver === 'undefined' ||
    !PerformanceObserver.supportedEntryTypes?.includes('interaction-contentful-paint')
  ) {
    return null;
  }

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      // entry.duration is already calculated as (entry.presentationTime - entry.startTime),
      // giving the total time from the user interaction to this contentful paint.
      onInteractionPaint(entry);
    }
  });

  // MANDATORY: Pass buffered: true to capture interaction paints that occurred
  // before this observer was registered.
  observer.observe({ type: 'interaction-contentful-paint', buffered: true });
  return observer;
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/interaction-paint-timing/guide.md#L1-L63). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
