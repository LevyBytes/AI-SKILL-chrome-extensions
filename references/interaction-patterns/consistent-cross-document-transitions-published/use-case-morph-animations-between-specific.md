#### Use Case 2: Morph Animations Between Specific Elements

When elements on both pages share a `view-transition-name`, the browser morphs them smoothly across the navigation. If the target element has not been parsed when the transition starts, the browser cannot find it — the morph degrades to separate exit and entry animations. Block rendering until the element with the `view-transition-name` has been parsed.

Because `<link rel="expect">` only pauses rendering until the target DOM element is parsed and does not wait for image data to download or decode, an uncached `<img>` may be captured as an empty rectangle in the new-page snapshot. To prevent blank snapshots or layout shifts during image morphs, preload or pre-decode critical transition images (for example, with `<link rel="preload" as="image">` or by prerendering the destination page) and provide explicit sizing fallbacks (`width` and `height` attributes or CSS `aspect-ratio`, plus a placeholder background color).

```html
<head>
  <link rel="stylesheet" href="/css/styles.css">

  <!--
    DO: Preload critical transition images so their pixels are
    available to decode before the new-page snapshot is captured.
    <link rel="expect"> only waits for the DOM element to be parsed,
    NOT for image pixels to download or decode.
  -->
  <link rel="preload" as="image" href="/img/product.webp" fetchpriority="high">

  <!--
    DO: Block rendering until the element participating in the
    morph animation has been parsed. Without this, the browser
    may start the transition before #hero exists, causing the
    morph to degrade to a fade-out/fade-in.
  -->
  <link rel="expect" href="#hero" blocking="render">

  <!--
    When multiple blocking="render" resources are present,
    rendering is blocked until ALL of them are satisfied.
    Here, the browser waits for both the script to execute
    AND the #hero element to be parsed — whichever comes last.
  -->
  <script async blocking="render" src="/js/transition-setup.js"></script>
</head>
<body>
  <header>...</header>
  <section id="hero">
    <h1 style="view-transition-name: page-title">Product Name</h1>
    <!--
      DO: Provide explicit dimensions (width/height or aspect-ratio)
      as a sizing fallback so the snapshot captures the correct layout
      box even if image decoding is still in progress.
    -->
    <img
      style="view-transition-name: hero-image"
      src="/img/product.webp"
      width="800"
      height="600"
      alt="Product"
    >
  </section>
</body>
```

### Step 4: Use Media Queries for Responsive Render Blocking

Different viewport sizes may show different amounts of content above the fold. Use the `media` attribute on `<link rel="expect">` to block rendering only for the content visible at a given viewport width.

```html
<head>
  <!--
    DO: Use media queries to conditionally block rendering.
    On wide screens, both the hero and the sidebar are visible,
    so block until both are parsed. On narrow screens, only the
    hero is visible initially.
  -->
  <link
    rel="expect"
    href="#hero"
    blocking="render"
    media="screen and (width <= 768px)"
  >
  <link
    rel="expect"
    href="#sidebar"
    blocking="render"
    media="screen and (width > 768px)"
  >
</head>
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/consistent-cross-document-transitions.md#L97-L177). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
