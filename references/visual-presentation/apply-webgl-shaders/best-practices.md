## Best Practices

- **MANDATORY**: Check browser support for the HTML-in-Canvas API before using it.
- **MANDATORY**: Always add the `content="drawable"` attribute to the `<canvas>` element.
- **MANDATORY**: ALWAYS add the `drawable` attribute to the direct children of the canvas.
- **MANDATORY**: Add the `drawable` attribute to every element that you want to be able to draw independently from its parent elements.
- **MANDATORY**: Use an `onpaint` event handler to render the HTML content to the canvas.
- **MANDATORY**: Pre-allocate the texture buffer with `texImage2D()` once (when it's initialized or when the element size changes). Reallocate the texture only when the size changes, and set `TEXTURE_MIN_FILTER` to `LINEAR`.
- **MANDATORY**: Use the `texElementSubImage2D` method to render the HTML content to a texture that you pre-allocate with `texImage2D()`, sized from `captureElementImage()`.
- **MANDATORY**: Sync the geometry of the HTML element with the rendered content by calling `canvas.updateElementGeometry(element, { canvasTransform })`.
- **MANDATORY**: Use `ResizeObserver` to observe the screen size and update the canvas size to match device pixels.
- **DO NOT** embed cross-origin content in a canvas, as it is not supported.
- **DO NOT** initialize `ResizeObserver` within the `onpaint` event handler, as it may lead to memory leaks.

### Fallback strategies

{{ BASELINE_STATUS("canvas-html") }}

The HTML-in-Canvas API is not currently supported in all modern browsers, thus a fallback strategy is typically required.

However, given the improved performance benefits of this API, HTML-in-Canvas should be used if the browser supports it.

The fallback strategy depends on the use case. For example, for an interactive HTML content in canvas, if HTML-in-Canvas is not supported, place the HTML content on top of the canvas using CSS.

### HTML-in-Canvas polyfill

Use the following polyfill script to mimic the HTML-in-Canvas API in browsers that do not support it.

1. Install or embed the library:

```
# Install
npm install three-html-render
```

```
# Embed
<script src="https://cdn.jsdelivr.net/npm/three-html-render/dist/polyfill.js"></script>
```

2. Run the `installHtmlInCanvasPolyfill()` method to translate HTML-in-Canvas.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/visual-design/apply-webgl-shaders/guide.md#L242-L282). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
