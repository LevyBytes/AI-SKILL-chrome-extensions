- The page should initially render fallback content (such as a loading skeleton) within a range defined by `<?start>` and `<?end>` processing instructions.
- The fallback content should be automatically replaced by the final content delivered in a `<template for="...">` element once that part of the HTML stream is processed.
- Placeholder containers should have stable dimensions (e.g. `min-height` or `aspect-ratio`) to prevent layout shifts when the content is patched.
- Imperative updates stream the fetch response into a streaming HTML method with `pipeTo()`, decoding it with `Response.textStream()` or `pipeThrough(new TextDecoderStream())`.
- HTML from users or other untrusted sources is written with a safe method (such as `setHTML()` or `streamHTML()`), not with an `...Unsafe()` method.
- The `runScripts: true` option must only be passed to an unsafe method when writing content that contains trusted `<script>` elements.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/out-of-order-html-streaming/expectations.md#L1-L6). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
