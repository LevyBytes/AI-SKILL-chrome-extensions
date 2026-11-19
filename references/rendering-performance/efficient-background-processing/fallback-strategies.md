Related section: [Efficient background processing](overview.md).
### Fallback strategies

{{ BASELINE_STATUS("content-visibility") }}

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

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/efficient-background-processing/guide.md#L90-L125). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
