Related section: [Out of order html streaming](overview.md).
### 2. Imperative JS Streaming

The browser provides a suite of 24 methods (6 actions, each with 4 variations) to update the DOM either statically (from a string) or via a stream.

#### API Reference Matrix

| Action | Static (Safe) | Streaming (Safe) | Static (Unsafe) | Streaming (Unsafe) |
| :--- | :--- | :--- | :--- | :--- |
| **Set** | `setHTML()` | `streamHTML()` | `setHTMLUnsafe()` | `streamHTMLUnsafe()` |
| **Replace** | `replaceWithHTML()` | `streamReplaceWithHTML()` | `replaceWithHTMLUnsafe()` | `streamReplaceWithHTMLUnsafe()` |
| **Before** | `beforeHTML()` | `streamBeforeHTML()` | `beforeHTMLUnsafe()` | `streamBeforeHTMLUnsafe()` |
| **Prepend** | `prependHTML()` | `streamPrependHTML()` | `prependHTMLUnsafe()` | `streamPrependHTMLUnsafe()` |
| **Append** | `appendHTML()` | `streamAppendHTML()` | `appendHTMLUnsafe()` | `streamAppendHTMLUnsafe()` |
| **After** | `afterHTML()` | `streamAfterHTML()` | `afterHTMLUnsafe()` | `streamAfterHTMLUnsafe()` |

#### Key Concepts

* **Safe vs. Unsafe**: 
  * **Safe** methods (e.g., `setHTML()`) use a built-in sanitizer by default to strip potentially dangerous content like `<script>` tags. You can pass a custom `Sanitizer` object in the options to apply in addition to the default sanitizer.
  * **Unsafe** methods (e.g., `setHTMLUnsafe()`) do not sanitize by default, but you can still pass a custom `Sanitizer`. To allow scripts to execute in the new content, you must explicitly pass `{ runScripts: true }` in the options. **IMPORTANT**: Only use unsafe methods with trusted content where safe methods would not work.
* **Static vs. Streaming**:
  * **Static** methods take a string (or `TrustedHTML`) and apply it immediately.
  * **Streaming** methods return a `WritableStream`. This allows you to pipe content (e.g., from a `fetch` response) directly into the DOM, and the browser will render it incrementally as chunks arrive.

#### Example: Streaming a Fetch Response

You can pipe fetch responses directly into the DOM without manual chunk handling.

```javascript
const main = document.querySelector('main');
const response = await fetch('/api/partial-update');

// Pipe the stream directly into the element
await response.body
  .pipeThrough(new TextDecoderStream())
  .pipeTo(main.streamHTMLUnsafe({ runScripts: true }));

// Or use the `textStream()` convenience method which streams directly without needing the intermediate `TextDecoderStream()` step
await response
  .textStream()
  .pipeTo(main.streamHTMLUnsafe({ runScripts: true }))
```

## Use Case Reference Matrix

* **Island Architecture**: Hydrate independent interactive components on top of static HTML without a full framework runtime.
* **Deferred "Expensive" Blocks**: Deliver the shell of a page immediately and stream database-heavy components as they become available.
* **Single Page Application (SPA) Updates**: Stream large UI transitions in SPAs using `streamHTML()` instead of waiting for a full JSON payload and manual DOM construction.

## Anti-Patterns & Warnings (DO NOT DO THIS)

* **Do not use OOO streaming for everything.** Over-fragmenting a page can increase the complexity of the stream and potentially delay content if the browser spends too much time patching small nodes.
* **Do not ignore Trusted Types.** When using `*Unsafe` methods in environments with Trusted Types enforced, ensure you are passing a sanitized policy object if required.
* **Do not assume script execution order.** Scripts inside a `<template for>` will execute as soon as they are patched into the document. Do not rely on them executing in a specific sequence relative to other deferred templates.
* **Do not use without a polyfill strategy.** Ensure you have a fallback or use polyfills (`html-setters-polyfill` and `template-for-polyfill`) to support your required browsers until this feature becomes Baseline.

## Fallback strategies

Browser support for `<template for>`: Limited availability.
Supported by: Chrome 150 (Jun 2026) and Edge 150 (Jul 2026).
Unsupported in: Firefox and Safari.

Browser support for HTML setter methods: Limited availability.
Supported by: Chrome 157 (Nov 2026) and Edge 157 (Nov 2026).
Unsupported in: Firefox and Safari.

HTML streaming setters is not natively supported by any major browser yet.

Browser support for HTML processing instructions: Limited availability.
Supported by: Chrome 150 (Jun 2026) and Edge 150 (Jul 2026).
Unsupported in: Firefox and Safari.

You can use polyfills like `template-for-polyfill` and `html-setters-polyfill` to emulate the API surface for non-supporting browsers.

Browsers without `html-processing-instructions` support parse `<?marker>`, `<?start>`, and `<?end>` as comments. `template-for-polyfill` still recognizes these comments as markers, so keep the same processing instruction syntax for all browsers. Do not rewrite the markers as HTML comments or elements for non-supporting browsers.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/performance/out-of-order-html-streaming.md#L95-L169). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
