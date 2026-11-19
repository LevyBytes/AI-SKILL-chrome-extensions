### 1. Declarative HTML Markers

The browser looks for specific processing instructions to identify where content should be patched.

```html
<!-- A simple insertion point -->
<div id="sidebar">
  <?marker name="dynamic-comments">
</div>

<!-- A replacement range with loading state -->
<main>
  <?start name="main-content">
    <div class="skeleton" role="status">Loading main content...</div>
  <?end>
</main>

... (other content) ...

<!-- Later in the same stream, provide the content -->
<template for="dynamic-comments">
  <div class="comments">...</div>
</template>

<template for="main-content">
  <article>
    <h1>The Real Content</h1>
    <p>This replaces the skeleton div automatically.</p>
  </article>
</template>
```

Once a `<template>` replaces an insertion point, that insertion point no longer exists, and can not be reused. However, a `<template>` may contain insertion points that can be used later in the stream.

```html
 <?start name="replaced-content">
  <div class="skeleton">
<?end>
<!-- Later in the same stream, provide initial content -->
<template for="replaced-content">
  <?start name="replaced-content">
    <div>Quickly computed result</div>
  <?end>
</template>
<!-- Later in the same stream, provide full content -->
<template for="replaced-content">
  <?start name="replaced-content">
    <div>Full result</div>
  <?end>
</template>
```

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


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/out-of-order-html-streaming/guide.md#L54-L148). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
