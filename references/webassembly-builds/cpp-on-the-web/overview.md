```yaml
---
name: cpp-on-the-web
description: Compile C/C++ to WebAssembly using Emscripten
web-feature-ids:
  - wasm
---
```

# Compiling C and C++ to WebAssembly with Emscripten

{#
Maintainer note: Sections 1, 2, and 3 of this guide are synced with the
upstream Emscripten "Best Practices" documentation:
- Published page: https://emscripten.org/docs/compiling/best_practices.html
- Upstream source: site/source/docs/compiling/best_practices.rst in
  https://github.com/emscripten-core/emscripten
When updating upstream Emscripten best practices, keep Sections 1-3 aligned.
#}

Use Emscripten (`emcc` and `em++`) to compile C and C++ into high-performance
WebAssembly (Wasm) modules for the browser.

## 1. Recommended Emscripten Compilation Flags

{#
Source: "Recommended Flags" in
https://emscripten.org/docs/compiling/best_practices.html
#}

When compiling and linking with `emcc` or `em++`, use modern modular flags:

- `-sSTRICT`: Opt into strict modern Emscripten behavior and disable deprecated
  or legacy compatibility features.
- `-sEXPORT_ES6`: Emit a standard ES6 module (`import`/`export`). This option
  automatically implies `-sMODULARIZE`, encapsulating generated code so it does
  not pollute the global namespace.
- `-sENVIRONMENT=web` (or `-sENVIRONMENT=worker` when running solely inside a
  Web Worker, or `-sENVIRONMENT=web,worker` for both): Strip Node.js and shell
  runtime support code to minimize bundle size.
- `-sALLOW_MEMORY_GROWTH`: Allow the WebAssembly linear memory heap to expand
  dynamically when allocations exceed the initial heap size.
- `-Werror -Wall`: Treat compiler warnings as errors to catch C/C++ bugs and
  invalid compiler settings early.
- `-O3`, `-Os`, or `-Oz` with `-flto`: In release builds, choose `-O3` when
  runtime performance is most critical, or `-Os` / `-Oz` when minimizing binary
  payload size is the priority. Pass `-flto` during both compilation and
  linking for Link-Time Optimization.

### Command-Line Style

{#
Source: "Command-Line Style" in
https://emscripten.org/docs/compiling/best_practices.html
#}

Keep `emcc` and `em++` invocations clean, minimal, and consistent:

- **Omit settings that are enabled by default**: Do not pass redundant flags
  that are already default in modern Emscripten, such as `-sWASM`, or
  `-sMODULARIZE` when `-sEXPORT_ES6` is already specified.
- **Omit the `=1` suffix on boolean `-s` flags**: Write `-sSTRICT`,
  `-sEXPORT_ES6`, and `-sALLOW_MEMORY_GROWTH` rather than `-sSTRICT=1`,
  `-sEXPORT_ES6=1`, or `-sALLOW_MEMORY_GROWTH=1`.
- **Prefer standard compiler flags over Emscripten-specific ones**: Use
  `-pthread` instead of `-sUSE_PTHREADS`, and `-m64` instead of `-sMEMORY64`.
- **Use simple comma-separated lists**: For list-based settings, pass
  comma-separated values without brackets or quotes (for example,
  `-sEXPORTED_FUNCTIONS=_render,_malloc,_free` and
  `-sEXPORTED_RUNTIME_METHODS=HEAPU8`) rather than JSON arrays like
  `-sEXPORTED_FUNCTIONS=['_render','_malloc','_free']`.
- **Use response files for long lists**: If an export list is large, pass a
  response file (`@filename`) instead of a long inline list (for example,
  `-sEXPORTED_FUNCTIONS=@exported_funcs.txt`).
- **Use separate compilation for multi-file projects**: Compile `.c` / `.cpp`
  sources to `.o` object files (`em++ -c`) before linking them into the final
  module rather than combining everything into a single monolithic invocation.

```bash
# Compile C++ source to an object file
em++ -c renderer.cpp -o renderer.o -O3 -flto -Werror -Wall

# Link into an ES6 WebAssembly module targeting a Web Worker
em++ renderer.o -o renderer.js \
  -O3 -flto \
  -sSTRICT \
  -sEXPORT_ES6 \
  -sENVIRONMENT=worker \
  -sALLOW_MEMORY_GROWTH \
  -sEXPORTED_FUNCTIONS=_render_frame,_malloc,_free \
  -sEXPORTED_RUNTIME_METHODS=HEAPU8
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/wasm/cpp-on-the-web/guide.md#L1-L91). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Includes guidance credited to the [Emscripten project](https://emscripten.org/docs/compiling/best_practices.html). Reorganized for this edition.
