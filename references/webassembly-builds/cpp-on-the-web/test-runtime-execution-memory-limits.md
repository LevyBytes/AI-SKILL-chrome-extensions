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

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/wasm/cpp-on-the-web/guide.md#L178-L228). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Includes guidance credited to the [Emscripten project](https://emscripten.org/docs/compiling/best_practices.html). Reorganized for this edition.
