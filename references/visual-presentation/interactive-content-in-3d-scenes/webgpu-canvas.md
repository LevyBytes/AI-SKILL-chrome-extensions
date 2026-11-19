### WebGPU Canvas

```html
<canvas id="canvas" content="drawable" style="width: 400px; height: 400px;">
  <div id="ui-element" drawable>
    <p>WebGPU UI Element</p>
  </div>
</canvas>

<script>
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("webgpu");
  const uiElement = document.getElementById("ui-element");

  // getElementImageSize() and ensureElementTexture() are defined in step 4.
  // computeCanvasTransform() is defined in step 5.

  // Setup WebGPU...
  // const device = ...
  const textureState = { texture: null };

  canvas.onpaint = () => {
    // 1. Copy HTML content to a texture that matches the element size
    const size = getElementImageSize(canvas, uiElement);
    if (size) {
      const previousTexture = textureState.texture;
      const texture = ensureElementTexture(device, textureState, size.width, size.height);
      if (texture !== previousTexture) {
        // New texture: create, or rebuild, the bind groups that reference it.
      }
      try {
        device.queue.drawElementImageToTexture({ source: uiElement }, { texture, size });
      } catch (err) {
        console.error('drawElementImageToTexture copy failed:', err);
      }
    }

    // ... Render your 3D scene here, calculating htmlElementMVP matrix ...

    // 2. Sync DOM position, hit testing, and accessibility bounds (same matrix math as WebGL)
    canvas.updateElementGeometry(uiElement, {
      canvasTransform: computeCanvasTransform(canvas, uiElement, htmlElementMVP),
    });
  };
</script>
```

### Three.js

```js
// 1. Initialize Three.js camera, scene, renderer, mesh, interactions;

// 2. Ensure HTML-in-Canvas feature support
if (!('content' in HTMLCanvasElement.prototype)) {
  // Use a fallback strategy
}

// 3. Initialize the source HTML DOM element
const element = document.createElement('div');
element.innerHTML = '<h1>Hello World</h1>';

// 4. Create geometry and material
const geometry = new RoundedBoxGeometry( 100, 100, 100, 10, 10 );
const material = new THREE.MeshStandardMaterial( { roughness: 0, metalness: 0.5 } );

// 5. Pass the DOM element into THREE.HTMLTexture
material.map = new THREE.HTMLTexture(element);

mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );

// 6. Make the HTML element interactive
interactions = new InteractionManager();
interactions.connect( renderer, camera );
interactions.add( mesh );

// 7. Render Loop
function animate() {
  // Keep the HTML element aligned with the mesh, so it receives input
  interactions.update();
  renderer.render(scene, camera);
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/visual-design/interactive-content-in-3d-scenes/guide.md#L324-L407). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
