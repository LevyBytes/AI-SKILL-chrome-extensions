### Inline Experiment Script

If the experiment logic is lightweight enough to inline, use an inline module script with `blocking="render"`. This is useful when the experiment logic fetches a configuration and applies DOM changes directly.

```html
<head>
  <!--
    DO: Use an inline module script when the experiment logic is small.
    Module scripts are deferred by default (non-parser-blocking),
    and blocking="render" ensures rendering waits for execution.
  -->
  <script type="module" blocking="render">
    // Fetch the experiment configuration from your testing platform.
    const config = await fetch('/api/experiment?id=homepage-cta')
      .then(res => res.json());

    // Apply the variant by setting a data attribute on <html>.
    // CSS rules keyed to this attribute will style the variant.
    document.documentElement.dataset.variant = config.variant;
  </script>

  <style>
    /* Default styles (control group) */
    .cta-button {
      background-color: blue;
    }

    /* Variant B styles, activated by the data attribute */
    [data-variant="b"] .cta-button {
      background-color: green;
    }
  </style>
</head>
```

## Best Practices

- **MANDATORY:** The experimentation script MUST execute quickly. A slow script delays all rendering. Set a performance budget (e.g., under 100ms execution time) for the render-blocking script.
- **DO** split heavy experiment logic from the render-blocking script. Load a small, render-blocking stub that applies the variant, then load heavier tracking or analytics scripts separately with `async` or `defer` (without `blocking="render"`).
- **DO** use a data attribute on `<html>` or `<body>` to signal the active variant, and use CSS selectors keyed to that attribute for variant styling. This avoids direct DOM manipulation in the render-blocking script.
- **DO NOT** use `blocking="render"` on analytics, tracking, or other non-visual scripts. Only scripts that must change what the user sees on first paint should block rendering.
- **DO NOT** combine `blocking="render"` with legacy anti-flicker snippets. They solve the same problem; using both creates unnecessary delays.

## Fallback Strategies

{{ BASELINE_STATUS("blocking-render") }}

The `blocking` attribute is not supported in all browsers. In browsers that do not support it, the attribute is ignored and the script loads with its default behavior (`async` in the examples above), which may result in flicker. A fallback is required to prevent flicker in unsupported browsers.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/flicker-free-client-side-ab-testing/guide.md#L67-L115). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
