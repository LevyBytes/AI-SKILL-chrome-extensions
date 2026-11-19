## Best Practices

- **MANDATORY**: Check browser support for the HTML-in-Canvas API before using it.
- **MANDATORY**: When using WebGL or WebGPU, always add the `content="drawable"` attribute to the `<canvas>` element.
- **MANDATORY**: When using WebGL or WebGPU, add the `drawable` attribute to every element that you draw, including direct children of the canvas.
- **MANDATORY**: When using WebGL or WebGPU, use an `onpaint` event handler to render the HTML content to the canvas.
- **MANDATORY**: When using WebGL, pre-allocate the texture buffer with `texImage2D()` once (when it's initialized or when the element size changes). Reallocate the texture only when the size changes, and set `TEXTURE_MIN_FILTER` to `LINEAR`.
- **MANDATORY**: When using WebGL, use the `texElementSubImage2D` method to render the HTML content to a texture that you pre-allocate with `texImage2D()`, sized from `captureElementImage()`.
- **MANDATORY**: When using WebGPU, use the `drawElementImageToTexture` method to render the HTML content to the canvas. Size the texture from `captureElementImage()`, and recreate it only when the size changes. Create the texture with `COPY_DST` and `RENDER_ATTACHMENT` usage, and pass the texture size as `size`.
- **MANDATORY**: When using WebGL or WebGPU, sync the geometry of the HTML element with the rendered content by calling `canvas.updateElementGeometry(element, { canvasTransform })`.
- **MANDATORY**: When using Three.js, register the mesh with `InteractionManager`, and call `interactions.update()` in the animation loop, so the HTML element receives input.
- **MANDATORY**: Observe the screen size and update the canvas size to match device pixels, for example, by using `ResizeObserver`.
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

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/visual-design/interactive-content-in-3d-scenes/guide.md#L408-L449). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
