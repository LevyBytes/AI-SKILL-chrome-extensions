Then pass the transform to `canvas.updateElementGeometry()` as `canvasTransform`. This moves the HTML element to sit directly on top of its rendered pixels. This ensures that when a user clicks a button or selects text, they are actually hitting the real HTML element. The browser also uses the transform for the element's accessibility bounds, for example, for screen reader focus rings:

  ```js
  canvas.updateElementGeometry(targetHTMLElement, {
    canvasTransform: computeCanvasTransform(canvas, targetHTMLElement, htmlElementMVP),
  });
  ```

Use these options to control hit testing:
  - Each `updateElementGeometry()` call moves the element to the top of the hit-testing order. Pass `{ preserveHitTestOrder: true }` to keep its position.
  - Call `canvas.clearElementGeometry(element)` to remove an element from hit testing, for example, when you hide it.

### Three.js

1. Check if HTML-in-Canvas is supported in the browser:

```js
if ('content' in HTMLCanvasElement.prototype) {
  // Use HTML in Canvas API
} else {
  // Use fallback strategy
}
```

2. Create a custom geometry and material for the HTML content.

3. Pass the DOM element into THREE.HTMLTexture. The renderer adds the element to its canvas, and sets the required attributes:
```js
  material.map = new THREE.HTMLTexture(element);
  mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );
```

4. Register the mesh with `InteractionManager` to make the HTML element interactive. It keeps the element aligned with the mesh, and syncs the element geometry with the canvas, so that clicks and text selection hit the real HTML element. Call `interactions.update()` in the animation loop, before rendering:
```js
  import { InteractionManager } from 'three/addons/interaction/InteractionManager.js';

  const interactions = new InteractionManager();
  interactions.connect( renderer, camera );
  interactions.add( mesh );

  // In the animation loop
  interactions.update();
  renderer.render( scene, camera );
```

## Example code

### WebGL Canvas

```html
<canvas id="canvas" content="drawable" style="width: 400px; height: 400px;">
  <div id="ui-element" drawable>
    <p>WebGL UI Element</p>
    <button>Action</button>
  </div>
</canvas>

<script>
  const canvas = document.getElementById("canvas");
  const gl = canvas.getContext("webgl2");
  const uiElement = document.getElementById("ui-element");

  // getElementImageSize(), allocateElementTexture(), and uploadElementWebGL()
  // are defined in step 4.
  // computeCanvasTransform() is defined in step 5.

  // Setup WebGL texture...
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  const textureState = { width: 0, height: 0 };

  canvas.onpaint = () => {
    // 1. Update texture with HTML content
    try {
      uploadElementWebGL(gl, canvas, texture, uiElement, textureState);
    } catch (err) {
      console.error('texElementSubImage2D copy failed:', err);
    }

    // ... Render your 3D scene here, calculating htmlElementMVP matrix ...

    // 2. Sync DOM position, hit testing, and accessibility bounds with 3D scene
    canvas.updateElementGeometry(uiElement, {
      canvasTransform: computeCanvasTransform(canvas, uiElement, htmlElementMVP),
    });
  };
</script>
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/visual-design/interactive-content-in-3d-scenes/guide.md#L234-L323). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
