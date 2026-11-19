Related section: [Flicker free client side ab testing](overview.md).
## Best Practices

- **MANDATORY:** The experimentation script MUST execute quickly. A slow script delays all rendering. Set a performance budget (e.g., under 100ms execution time) for the render-blocking script.
- **DO** split heavy experiment logic from the render-blocking script. Load a small, render-blocking stub that applies the variant, then load heavier tracking or analytics scripts separately with `async` or `defer` (without `blocking="render"`).
- **DO** use a data attribute on `<html>` or `<body>` to signal the active variant, and use CSS selectors keyed to that attribute for variant styling. This avoids direct DOM manipulation in the render-blocking script.
- **DO NOT** use `blocking="render"` on analytics, tracking, or other non-visual scripts. Only scripts that must change what the user sees on first paint should block rendering.
- **DO NOT** combine `blocking="render"` with legacy anti-flicker snippets. They solve the same problem; using both creates unnecessary delays.

## Fallback Strategies

Browser support for blocking="render": Limited availability.
Supported by: Chrome 105 (Sep 2022), Edge 105 (Sep 2022), and Safari 18.2 (Dec 2024).
Unsupported in: Firefox.

The `blocking` attribute is not supported in all browsers. In browsers that do not support it, the attribute is ignored and the script loads with its default behavior (`async` in the examples above), which may result in flicker. A fallback is required to prevent flicker in unsupported browsers.

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

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/performance/flicker-free-client-side-ab-testing.md#L95-L168). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
