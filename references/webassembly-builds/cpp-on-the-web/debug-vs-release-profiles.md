### Debug vs. Release Profiles

{#
Source: "Debug vs. Release Profiles" in
https://emscripten.org/docs/compiling/best_practices.html
#}

Keep compile and link flags consistent within each build profile, and never
ship debug information in production:

- **Release builds**: Use `-O3`, `-Os`, or `-Oz` combined with `-flto` on both
  compile and link steps, and omit `-g` and `-sASSERTIONS`. Add `--closure=1`
  when linking to minify the generated JavaScript glue code unless an external
  bundler already minifies it.
- **Debug builds**: Use `-g` when compiling and `-g`, `-gline-tables-only`, or
  `-gsource-map` when linking, alongside `-sASSERTIONS`. Avoid optimization
  flags (`-O2`, `-O3`, `-Os`, `-Oz`) and `-flto` in debug builds for faster
  compilation and accurate source-level debugging.

## 2. JavaScript-WebAssembly Boundary Efficiency

{#
Source: "General Recommendations" in
https://emscripten.org/docs/compiling/best_practices.html
#}

Avoid high-frequency calls across the JavaScript-WebAssembly boundary. Calling
an exported Wasm function per pixel, per audio sample, or per vertex incurs
boundary overhead that negates Wasm performance gains.

Instead, design C/C++ entry points to process entire buffers or memory regions
in a single call and read or write the contiguous buffer in linear memory:

```js
import initRenderer from './renderer.js';

const wasm = await initRenderer();
const byteLength = width * height * 4;
const ptr = wasm._malloc(byteLength);

try {
  wasm._render_frame(ptr, width, height, samples);
  const pixels = new Uint8ClampedArray(
    wasm.HEAPU8.buffer,
    ptr,
    byteLength,
  ).slice();
  self.postMessage({ pixels, width, height }, [pixels.buffer]);
} finally {
  wasm._free(ptr);
}
```

Note: Accessing `wasm.HEAPU8.buffer` directly after calls that may grow memory
requires reading `wasm.HEAPU8` fresh after the Wasm call returns, because
`-sALLOW_MEMORY_GROWTH` detaches the previous `ArrayBuffer` when resizing.

## 3. Avoid Blocking the Main Thread

{#
Source: "Common Pitfalls -> Asynchronous Code Execution and Main Thread
Blocking" in https://emscripten.org/docs/compiling/best_practices.html
#}

The browser relies on cooperative multitasking on the main UI thread. Any
WebAssembly call that takes more than a few milliseconds (such as image
rendering, ray tracing, physics simulation, or heavy parsing) **must not** run
synchronously on the main thread, or it will freeze page rendering and input.

Use one of these approaches to keep the UI responsive:

1. **Run the WebAssembly module in a Web Worker**: Instantiate and call the
   ES6 Wasm module inside a dedicated module Worker
   (`new Worker(new URL('./worker.js', import.meta.url), { type: 'module' })`),
   and pass rendered buffers back via `postMessage` with transferable
   `ArrayBuffer` objects.
2. **Use multithreading (`-pthread`)**: Offload heavy compute across background
   workers using standard POSIX threads. Note that `-pthread` requires
   `SharedArrayBuffer`, which requires serving the page in a cross-origin
   isolated context (`Cross-Origin-Opener-Policy: same-origin` and
   `Cross-Origin-Embedder-Policy: require-corp`).
3. **Yield to the browser event loop**: Restructure continuous loops in C/C++
   to run one frame at a time via `emscripten_set_main_loop`, or use
   JavaScript Promise Integration (`-sJSPI`) / Asyncify (`-sASYNCIFY`) when
   synchronous C/C++ code must pause for asynchronous JavaScript APIs.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/wasm/cpp-on-the-web/guide.md#L92-L177). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Includes guidance credited to the [Emscripten project](https://emscripten.org/docs/compiling/best_practices.html). Reorganized for this edition.
