## Best Practices

- **MANDATORY**: Check browser support for the HTML-in-Canvas API before using it.
- **MANDATORY**: Always add the `content="drawable"` attribute to the `<canvas>` element.
- **MANDATORY**: Add the `drawable` attribute to every element that you draw, including direct children of the canvas.
- **MANDATORY**: Use an `onpaint` event handler to render the HTML content to the canvas.
- **MANDATORY**: Use the `drawElementImage` method in 2D, or `drawElementImageToTexture` in WebGPU, to render the HTML content to the canvas.
- **MANDATORY**: In WebGL, pre-allocate the texture buffer with `texImage2D()` once (when it's initialized or when the element size changes). Reallocate the texture only when the size changes, and set `TEXTURE_MIN_FILTER` to `LINEAR`.
- **MANDATORY**: In WebGL, use the `texElementSubImage2D` method to render the HTML content to a texture that you pre-allocate with `texImage2D()`, sized from `captureElementImage()`.
- **MANDATORY**: In WebGPU, size the texture from `captureElementImage()`, and recreate it only when the size changes. Create the texture with `COPY_DST` and `RENDER_ATTACHMENT` usage, and pass the texture size as `size`.
- **MANDATORY**: Sync the geometry of the HTML element with the rendered content. In 2D, `drawElementImage` does it automatically. In WebGL and WebGPU, call `canvas.updateElementGeometry(element, { canvasTransform })`.
- **MANDATORY**: Use `ResizeObserver` to observe the screen size and update the canvas size to match device pixels.
- **DO NOT** embed cross-origin content in a canvas, as it is not supported.
- **DO NOT** initialize `ResizeObserver` within the `onpaint` event handler, as it may lead to memory leaks.

## Fallback strategies

Browser support for HTML-in-canvas: Limited availability.
Supported by: Chrome 157 (Nov 2026) and Edge 157 (Nov 2026).
Unsupported in: Firefox and Safari.

The HTML-in-Canvas API is not currently supported in all modern browsers, thus a fallback strategy is typically required. However, given the improved performance benefits of this API, HTML-in-Canvas should be used if the browser supports it.

For the use case where HTML content needs to be exported from a canvas, use libraries like `html2canvas`, `dom-to-image`, or `snapdom`. 

To capture HTML interactions frame by frame, for example, for streaming, capture DOM mutations using libraries like `rrweb`. 

Alternatively, implement a warning that HTML media export is not supported in the browser because it doesn't support HTML-in-Canvas.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/visual-design/export-html-media-from-canvas.md#L299-L326). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
