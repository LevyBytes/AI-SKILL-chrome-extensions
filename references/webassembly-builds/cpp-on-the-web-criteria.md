- The application loads an ES6 WebAssembly module built with -sEXPORT_ES6 and -sSTRICT
- The Emscripten build targets only browser or worker environments (-sENVIRONMENT=web or worker)
- The Emscripten build uses release optimizations (-O2, -O3, -Os, or -Oz) with -flto and no -g debug flags
- The Emscripten command line omits =1 on boolean -s flags, uses comma-separated lists instead of JSON arrays, and omits redundant defaults (-sWASM, -sMODULARIZE)
- JavaScript exchanges pixel data with WebAssembly via linear memory buffers rather than per-pixel boundary calls
- The WebAssembly rendering runs off the main thread in a Web Worker so the UI remains responsive
- The page displays the rendered output on a canvas with a button that triggers a new render
- The browser console contains no unhandled errors or exceptions during module initialization and execution

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/wasm/cpp-on-the-web/expectations.md#L1-L8). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Includes guidance credited to the [Emscripten project](https://emscripten.org/docs/compiling/best_practices.html). Reorganized for this edition.
