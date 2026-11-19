Related section: [Efficient background processing](overview.md).
### Fallback strategies

Baseline status for content-visibility: Newly available. It's been Baseline since 2025-09-15.
Supported by: Chrome 108 (Nov 2022), Edge 108 (Dec 2022), Firefox 130 (Sep 2024), and Safari 26 (Sep 2025).

The `content-visibility` property and the associated `contentvisibilityautostatechange` event are progressive enhancements. In browsers that do not support them:
*   The CSS property is ignored, and the content is rendered normally.
*   The event never fires, so background tasks will continue to run as they normally would without optimization.

If you must support pausing tasks on older browsers, you can fallback to using `IntersectionObserver` as a rough approximation. This helps save battery and CPU on older devices too.

```javascript
// Fallback using IntersectionObserver for older browsers
const target = document.getElementById('target-container');

// Check if content-visibility is supported
const isSupported = 'contentVisibility' in document.documentElement.style;

if (!isSupported) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // The element is close to the screen. Start work!
        startSimulation();
      } else {
        // The element is far away. Pause work!
        stopSimulation();
      }
    });
  }, {
    // Use rootMargin to start rendering before it hits the screen
    rootMargin: '200px'
  });

  observer.observe(target);
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/performance/efficient-background-processing.md#L83-L119). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
