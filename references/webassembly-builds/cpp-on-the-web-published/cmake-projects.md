### CMake Projects

Wrap `cmake` and `make` with `emcmake` and `emmake`:

```bash
mkdir -p build && cd build
emcmake cmake .. -DCMAKE_BUILD_TYPE=Release
emmake make
```

### Autoconf / Make Projects

Use `emconfigure` to configure cross-compilation toolchain targets and disable
shared libraries:

```bash
emconfigure ./configure --host=wasm32-unknown-emscripten --disable-shared
emmake make
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/wasm/cpp-on-the-web.md#L169-L187). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Includes guidance credited to the [Emscripten project](https://emscripten.org/docs/compiling/best_practices.html). Reorganized for this edition.
