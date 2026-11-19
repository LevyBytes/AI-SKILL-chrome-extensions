```yaml
---
name: expose-canvas-content-to-browser-features
description: Expose content rendered in a canvas to browser features like assistive technologies, translation, or reading mode.
web-feature-ids:
  - canvas-html
---
```

# Expose canvas content to browser features

Regular `<canvas>` content is not exposed to browser features such as screen readers, indexing, translation tools, accessibility assistive tools, find-in-page, print, etc. With `HTML in canvas`, you can render real DOM directly in a canvas element. Adding the `content="drawable"` attribute to a `<canvas>` HTML element lays out its descendant HTML elements, and the `drawable` attribute marks the elements that you can render within the canvas's rendering context. You can use it to style and lay out text in a canvas, expose canvas content to browser features (like accessibility, translation, or find-in-page), and apply 2D and 3D effects to HTML.

## How to implement

1. Check if HTML-in-Canvas is supported in the browser:

```js
if ('content' in HTMLCanvasElement.prototype) {
  // Use HTML in Canvas API
} else {
  // Use fallback strategy
}
```

2. Add the `content="drawable"` attribute to the `<canvas>` HTML element.
3. Place your HTML content inside the `<canvas>` element, and add the `drawable` attribute to every element that you draw. An element with `drawable` captures its subtree, except nested descendants that are also `drawable`.

```html
<canvas id="canvas" content="drawable">
  <div id="html-content" drawable></div>
</canvas>
```

4. Scale your canvas grid to match the device scale factor to prevent blurriness:

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

5. Render the HTML content to the canvas inside a `canvas.onpaint` event handler. An element can only be drawn after the canvas has painted it: call `canvas.requestPaint()` to request a `paint` event.

- In 2D context, use the `drawElementImage` method. It draws the last snapshot of a `drawable` element, and its drawable subtree, starting at the element's border box, before CSS transforms:

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

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/visual-design/expose-canvas-content-to-browser-features/guide.md#L1-L88). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
