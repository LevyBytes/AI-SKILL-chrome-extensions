### Fallback: Anti-Flicker Snippet

DO: Use a lightweight anti-flicker snippet as a fallback only when `blocking="render"` is not supported. Feature-detect support and skip the fallback in browsers that handle it natively.

```html
<head>
  <!--
    DO: Load the experiment script with blocking="render" for
    browsers that support it. This is the preferred approach.
  -->
  <script
    src="https://cdn.example.com/experiment-sdk.js"
    async
    blocking="render"
  ></script>

  <script>
    // DO: Only apply the anti-flicker fallback in browsers
    // that do not support blocking="render".
    if (!Object.hasOwn(HTMLScriptElement.prototype, 'blocking')) {
      // Hide the page until the experiment script runs.
      document.documentElement.classList.add('ab-loading');

      // DO: Set a timeout to reveal the page if the experiment
      // script takes too long. This prevents an indefinitely
      // blank page on slow connections. Adjust the timeout
      // to match your experiment SDK's expected load time.
      setTimeout(() => {
        document.documentElement.classList.remove('ab-loading');
      }, 4000);
    }
  </script>

  <style>
    /*
      DO: Use opacity to hide content during experiment loading.
      This is only applied when blocking="render" is unsupported.
    */
    .ab-loading {
      opacity: 0 !important;
    }
  </style>
</head>
```

```javascript
// DO: In your experiment SDK's initialization callback,
// remove the fallback class to reveal the page.
function onExperimentReady() {
  document.documentElement.classList.remove('ab-loading');
}
```

## Other Considerations

1. **Performance Impact**: `blocking="render"` trades first-paint speed for visual correctness. Monitor Largest Contentful Paint (LCP) and First Contentful Paint (FCP) to ensure the experimentation script is not adding excessive delay.
2. **Third-Party Script Reliability**: If the experiment SDK is hosted on a third-party CDN, a CDN outage could block rendering entirely. The browser applies its own timeout heuristics (which may be longer than 4 seconds), but there is no developer-controlled timeout for `blocking="render"`. Ensure the third-party provider has strong uptime guarantees.
3. **Server-Side Alternatives**: For performance-critical pages, consider server-side A/B testing (where the server renders the correct variant directly) instead of client-side testing. Server-side approaches eliminate flicker entirely without any render-blocking cost. Use client-side `blocking="render"` only when server-side testing is not feasible.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/flicker-free-client-side-ab-testing/guide.md#L116-L173). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
