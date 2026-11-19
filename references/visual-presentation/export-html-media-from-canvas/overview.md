```yaml
---
name: export-html-media-from-canvas
description: Capture and export dynamic HTML content as images or video frames from within canvas.
web-feature-ids:
  - canvas-html
---
```

# Export HTML content from canvas

Web applications frequently need to capture and export rich HTML content—such as customized dashboards, styled documents, or interactive charts—as static images or video recordings. Historically, achieving this required bulky third-party libraries that manually parse DOM nodes and CSS properties to reconstruct a visual facsimile on a canvas. This approach is computationally expensive, error-prone, and frequently fails to support modern CSS layout features. With the HTML-in-Canvas API, developers can render real DOM elements directly into the canvas context. Because the browser's native rendering engine paints the HTML subtree with pixel-perfect accuracy, capturing the exact visual output as an image or video stream is highly efficient using built-in canvas methods like `toDataURL()`, `toBlob()`, or `captureStream()`.

## How to implement

1. Check if HTML-in-Canvas is supported in the browser:

```js
if ('content' in HTMLCanvasElement.prototype) {
  // Use HTML in Canvas API
} else {
  // Use fallback strategy
}
```

2. Initialize the canvas to support rendering of descendant HTML elements by adding the `content="drawable"` attribute to the `<canvas>` HTML element. Place your HTML content inside the `<canvas>` element, and add the `drawable` attribute to every element that you draw. An element with `drawable` captures its subtree, except nested descendants that are also `drawable`:

```html
<canvas id="canvas" content="drawable">
  <div id="html-content" drawable></div>
</canvas>
```

3. Scale your canvas grid to match the device scale factor to prevent blurriness:

```js
const observer = new ResizeObserver(([entry]) => {
  const dpc = entry.devicePixelContentBoxSize;
  canvas.width = dpc
    ? dpc[0].inlineSize
    : Math.round(entry.contentRect.width * window.devicePixelRatio);
  canvas.height = dpc
    ? dpc[0].blockSize
    : Math.round(entry.contentRect.height * window.devicePixelRatio);
});

const supportsDevicePixelContentBox =
  typeof ResizeObserverEntry !== "undefined" &&
  "devicePixelContentBoxSize" in ResizeObserverEntry.prototype;
const options = supportsDevicePixelContentBox
  ? { box: "device-pixel-content-box" }
  : {};
observer.observe(canvas, options);
```

4. Render the HTML content to the canvas inside a `canvas.onpaint` event handler. 
- In 2D context, use the `drawElementImage` method. It draws the last snapshot of a `drawable` element, and its drawable subtree (excluding other drawable children), starting at the element's border box, before CSS transforms:

```js
canvas.onpaint = () => {
  ctx.reset();
  // Draw the form element at x:0, y:0
  ctx.drawElementImage(form_element, 0, 0);
};
```

- In WebGL and WebGPU contexts, you copy the element into a texture. Size the texture from `canvas.captureElementImage(element)`. Its `width` and `height` are in canvas grid (backing store) pixels, so round them up with `Math.ceil()`. `captureElementImage()` throws if the element has no paint record yet: call `requestPaint()`, and retry on the next `paint` event.

```js
// Returns the element's size in canvas grid pixels, or null if the element
// has no paint record yet.
function getElementImageSize(canvas, element) {
  let elementImage;
  try {
    elementImage = canvas.captureElementImage(element);
  } catch (err) {
    canvas.requestPaint(); // No paint record yet: retry on the next paint event.
    return null;
  }
  const width = Math.ceil(elementImage.width);
  const height = Math.ceil(elementImage.height);
  elementImage.close();
  return width > 0 && height > 0 ? { width, height } : null;
}
```

- In WebGL context, pre-allocate the texture backing first using the `texImage2D` method. The snippets in this guide use a WebGL 2 context (`canvas.getContext("webgl2")`). Allocate texture storage by calling `texImage2D()` with `null` instead of pixel data, which reserves GPU memory of the given size and format without uploading any pixels. Follow these rules:
  - Size the texture from `captureElementImage()`, as shown above.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/visual-design/export-html-media-from-canvas/guide.md#L1-L86). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
