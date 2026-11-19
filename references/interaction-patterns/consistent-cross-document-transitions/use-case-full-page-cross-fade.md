#### Use Case 1: Full-Page Cross-Fade

Even when no individual elements have a `view-transition-name`, the default `root` transition cross-fades the entire page. If the new page's snapshot is taken before above-the-fold content is parsed, the cross-fade animates from the old page to a blank or incomplete page. Block rendering on an element that marks the end of the visible above-the-fold content.

```html
<head>
  <link rel="stylesheet" href="/css/styles.css">

  <!--
    DO: Block rendering until the main content area is parsed,
    even for a simple cross-fade. Without this, the browser may
    snapshot the page before visible content exists in the DOM,
    causing the cross-fade to reveal a blank or partial page.
  -->
  <link rel="expect" href="#main-content" blocking="render">
</head>
<body>
  <header>...</header>
  <main id="main-content">
    <h1>Page Title</h1>
    <p>Above-the-fold content the user should see immediately.</p>
  </main>
  <!-- Content below the fold does NOT need to be blocked on -->
  <section>...</section>
</body>
```

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


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/consistent-cross-document-transitions/guide.md#L79-L159). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
