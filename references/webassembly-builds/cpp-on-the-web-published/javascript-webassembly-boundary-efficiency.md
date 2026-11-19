## 2. JavaScript-WebAssembly Boundary Efficiency

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

## 4. Test Runtime Execution and Memory Limits

Always run and verify the compiled WebAssembly module in a real browser
environment and confirm that no warnings or unhandled errors appear in the
console:

- **Validate with `-sASSERTIONS` during development**: Build and test with
  `-sASSERTIONS` enabled to catch invalid memory accesses, missing exports, or
  ABI mismatches early, then remove `-sASSERTIONS` for the final release build.
- **Watch for stack overflows in recursive C/C++ code**: Emscripten's default
  execution stack size (`-sSTACK_SIZE`) is 64 KB, which is much smaller than
  native OS stacks. Deeply recursive algorithms (such as recursive ray tracers
  or tree traversals) can overflow the stack and corrupt linear memory unless
  converted to an iterative loop or linked with a larger stack (for example,
  `-sSTACK_SIZE=1MB`).

## 5. Avoid Dynamic Linking if Possible

Emscripten works best with static linking and static archive libraries (`.a`).
Shared libraries (`.so`, `.dylib`, `.dll`) and dynamic linking (`-sMAIN_MODULE`
/ `-sSIDE_MODULE`) add code-size and runtime overhead and should be avoided
unless runtime plugin loading is strictly required.

## 6. Porting Existing C/C++ Libraries and Build Integration

When integrating C/C++ compilation into a web application project, wire the
`emcc` / `em++` build into the project's build pipeline (such as the `"build"`
script in `package.json`) so that building the project compiles the WebAssembly
artifacts before bundling.

When building third-party C/C++ libraries with existing build systems:


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/wasm/cpp-on-the-web.md#L80-L168). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Includes guidance credited to the [Emscripten project](https://emscripten.org/docs/compiling/best_practices.html). Reorganized for this edition.
