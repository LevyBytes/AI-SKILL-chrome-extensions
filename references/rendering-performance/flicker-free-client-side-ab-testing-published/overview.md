Related section: [Best Practices](best-practices.md).
# Flicker-Free Client-Side A/B Testing

## The Problem

Client-side A/B testing tools work by loading a script that modifies the DOM after the browser has already begun constructing the page. Without intervention, the user briefly sees the original content before it flickers or flashes to the experiment variant. Testing platforms have historically worked around this with "anti-flicker snippets" that hide the entire page with `opacity: 0` until the experiment script finishes or an arbitrary timeout (typically 4 seconds) elapses. This approach sacrifices progressive rendering, allows accidental clicks on invisible content, and introduces unnecessary paint cycles.

## The Solution

The `blocking=render` attribute allows a `<script>` or `<link>` element placed in the `<head>` to block rendering—but not parsing—until the resource has been fetched and executed. This gives experimentation scripts the same render-blocking behavior that stylesheets have by default, ensuring the browser never paints the page until the experiment variant has been applied. No opacity hacks, no arbitrary timeouts, and no flicker.

### Implementation Strategy

1. **MANDATORY:** Place the experimentation script in the document `<head>` and add `blocking="render"`.
2. **MANDATORY:** Ensure the script either has `type="module"` (preferred for inline scripts) or `async` (preferred for external scripts with a `src` value).
3. **DO** keep the experimentation script small and fast. Because rendering is blocked until the script executes, a large or slow script directly delays first paint.
4. **DO NOT** use `blocking="render"` on scripts that do not need to run before first paint. It is intended only for scripts whose output must be visible in the initial render.
5. **DO NOT** apply `blocking="render"` to scripts outside the `<head>`. Only scripts in the `<head>` can block rendering.

## Implementation Guide

### Basic Setup

MANDATORY: Load the experimentation script with both `async` and `blocking="render"`. The `async` attribute ensures the script does not block HTML parsing (the browser continues building the DOM while fetching the script). The `blocking="render"` attribute ensures the browser does not paint anything until the script has executed.

```html
<head>
  <!--
    MANDATORY: Both `async` and `blocking="render"` are required.
    - `async`: Prevents parser-blocking, so the DOM is built in parallel.
    - `blocking="render"`: Holds rendering until the script executes,
      ensuring experiment changes are applied before the user sees anything.
  -->
  <script
    src="https://cdn.example.com/experiment-sdk.js"
    async
    blocking="render"
  ></script>
</head>
```

### Loading Experiment-Specific Styles

If the experiment requires a variant stylesheet, use `blocking="render"` on the `<link>` element. Stylesheets in the `<head>` already block rendering by default, but dynamically injected stylesheets or those added via script do not. Use `blocking="render"` explicitly when the stylesheet is added dynamically or when you want to be explicit about the intent.

```html
<head>
  <!--
    DO: Use blocking="render" on experiment stylesheets that are
    dynamically inserted or conditionally loaded by the experiment SDK.
    This ensures variant styles are applied before first paint.
  -->
  <link
    rel="stylesheet"
    href="https://cdn.example.com/experiment-variant-b.css"
    blocking="render"
  >
</head>
```

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


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/performance/flicker-free-client-side-ab-testing.md#L1-L94). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
