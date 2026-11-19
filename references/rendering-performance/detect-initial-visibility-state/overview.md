Related section: [Fallback strategies](fallback-strategies.md).
```yaml
---
name: detect-initial-visibility-state
description: Reliably determine whether a page was initially loaded in the background, even in cases where the script is loaded asynchronously after the user foregrounded the page.
web-feature-ids:
  - page-visibility-state
  - page-visibility
---
```

# Detect Initial Visibility State

Determining if a page was initially loaded in the background (e.g., opened in a new background tab) is critical for accurate performance monitoring. Pages loaded in the background often have delayed rendering and longer metric times (like First Contentful Paint). Identifying these pages allows you to filter them out of performance analytics to avoid skewed data.

The most accurate way to measure this is by using the `VisibilityStateEntry` API, which reliably records visibility changes on the browser's performance timeline, regardless of when your script actually executes.

### Detecting initial visibility and background time

MANDATORY: Use `performance.getEntriesByType('visibility-state')` to access the exact visibility history. Do not rely solely on checking `document.visibilityState` at execution time, as it is susceptible to race conditions.

```javascript
/**
 * Accurately determines visibility state history using the Performance API.
 */
function getVisibilityInfo() {
  // Retrieve VisibilityStateEntry members:
  const entries = performance.getEntriesByType('visibility-state');
  
  if (entries.length > 0) {
    const firstEntry = entries[0];
    
    // If the first performance entry for visibility is 'hidden',
    // the page was loaded in the background.
    const initiallyBackgrounded = firstEntry.name === 'hidden';
    
    // Find the precise, high-resolution timestamp of when the page 
    // was first backgrounded.
    let timeBackgrounded = null;
    for (const entry of entries) {
      if (entry.name === 'hidden') {
        // entry.startTime is used because it provides the exact browser 
        // timestamp of the visibility change, which is required for precision
        timeBackgrounded = entry.startTime;
        break;
      }
    }

    return {
      initiallyBackgrounded,
      timeBackgrounded
    };
  }
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/detect-initial-visibility-state/guide.md#L1-L53). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
