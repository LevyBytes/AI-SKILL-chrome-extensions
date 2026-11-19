Related section: [Contrast color](overview.md).
#### Option 2: Text Stroke with `paint-order` to preserve letterforms

Baseline status for paint-order: Widely available. It's been Baseline since 2024-03-22.
Supported by: Chrome 123 (Mar 2024), Edge 123 (Mar 2024), Firefox ≤66, and Safari ≤12.

```css
.badge--stroke {
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
}
```

#### Option 3: Translucent background overlay

```css
.badge--overlay {
  position: relative;
  color: #fff;
  overflow: hidden;
}
.badge--overlay::before {
  content: "";
  position: absolute;
  inset: 0;
  background-color: rgb(0 0 0 / 0.4);
  z-index: 0;
}
.badge--overlay span {
  position: relative;
  z-index: 1;
}
```

#### Option 4: Text Shadow

```css
.badge--shadow {
  text-shadow: 0 1px 3px rgb(0 0 0 / 0.8);
}
```

#### Option 5: SVG Filters

Baseline status for SVG filters: Widely available. It's been Baseline since 2015-07-29.
Supported by: Chrome 5 (May 2010), Edge 12 (Jul 2015), Firefox 3 (Jun 2008), and Safari 6 (Jul 2012).

1. Load this SVG filter definition. It must be added directly to the HTML document if you need to support Safari versions affected by [this WebKit bug](https://bugs.webkit.org/show_bug.cgi?id=320118), which prevents external and data url references for filters. Otherwise, it should be loaded from an external file, either an SVG file or inlined in CSS.

```html
<!-- Technique from https://miunau.com/posts/dynamic-text-contrast-in-css/ -->
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" height="0" style="display: none;">
  <defs>
    <filter id="contrast-filter" color-interpolation-filters="sRGB">
      <feColorMatrix type="matrix"
        values="0.2126 0.7152 0.0722 0 0
          0.2126 0.7152 0.0722 0 0
          0.2126 0.7152 0.0722 0 0
          0 0 0 1 0"/>
      <feMorphology operator="dilate" radius="2"/>
      <feComponentTransfer>
        <feFuncR type="linear" slope="-255" intercept="128"/>
        <feFuncG type="linear" slope="-255" intercept="128"/>
        <feFuncB type="linear" slope="-255" intercept="128"/>
      </feComponentTransfer>
      <feComposite operator="in" in2="SourceGraphic"/>
    </filter>
  </defs>
</svg>
```

2. Wrap the text in a `<span>`.

```html
<div class="badge--svg">
  <span>Badge content</span>
</div>
```

3. Apply the filter to the `<span>`.

```css
.badge--svg span{
  color: var(--badge-bg);
  filter: url(#contrast-filter);
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/visual-design/contrast-color.md#L91-L176). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
