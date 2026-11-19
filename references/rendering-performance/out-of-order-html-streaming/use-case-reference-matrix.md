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

{{ BASELINE_STATUS("template-for") }}
{{ BASELINE_STATUS("html-setters") }}
{{ BASELINE_STATUS("html-streaming-setters") }}
{{ BASELINE_STATUS("html-processing-instructions") }}

You can use polyfills like `template-for-polyfill` and `html-setters-polyfill` to emulate the API surface for non-supporting browsers.

Browsers without `html-processing-instructions` support parse `<?marker>`, `<?start>`, and `<?end>` as comments. `template-for-polyfill` still recognizes these comments as markers, so keep the same processing instruction syntax for all browsers. Do not rewrite the markers as HTML comments or elements for non-supporting browsers.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/out-of-order-html-streaming/guide.md#L149-L171). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
