Related section: [Sanitize untrusted html](overview.md).
## Fallbacks & browser support for Sanitizer API

{{ BASELINE_STATUS("sanitizer") }}

If the native Sanitizer API is not available in your target browsers, load a library like **DOMPurify** only when native support is missing, to avoid shipping it to browsers that don't need it. Use `in` checks for feature detection so the check itself works in older browsers.

```javascript
let domPurifyPromise;

function loadDOMPurify() {
  // Code-split with your bundler so DOMPurify is only downloaded when needed
  domPurifyPromise ??= import('dompurify').then((mod) => mod.default ?? mod);
  return domPurifyPromise;
}

export async function safeSetHTML(el, html) {
  const elements = ['p', 'b', 'i', 'strong', 'em'];
  const attributes = ['class'];

  if ('setHTML' in Element.prototype) {
    // setHTML() accepts a plain configuration object as the sanitizer
    el.setHTML(html, { sanitizer: { elements, attributes } });
  } else {
    const DOMPurify = await loadDOMPurify();
    el.innerHTML = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [...elements, '#text'],
      ALLOWED_ATTR: attributes,
      // Match the native Sanitizer: strip aria-*/data-* and disallowed element content
      ALLOW_ARIA_ATTR: false,
      ALLOW_DATA_ATTR: false,
      KEEP_CONTENT: false
    });
  }
}
```

By default, DOMPurify keeps `aria-*` and `data-*` attributes (even when `ALLOWED_ATTR` is specified) as well as the text content of elements it removes, while the native Sanitizer strips `aria-*` and `data-*` attributes and removes disallowed elements together with their content. Setting `ALLOW_ARIA_ATTR: false`, `ALLOW_DATA_ATTR: false`, `KEEP_CONTENT: false`, and allowing `#text` makes DOMPurify match the native behavior. DOMPurify has no built-in option equivalent to `replaceWithChildrenElements`, so avoid that option in configurations that need a matching fallback.

If the page enforces Trusted Types (`require-trusted-types-for 'script'`), assigning a string to `innerHTML` throws. `setHTML()` does not need a Trusted Types policy, but the fallback does: pass `RETURN_TRUSTED_TYPE: true` to `DOMPurify.sanitize()` and allow its `dompurify` policy name in your `trusted-types` CSP directive.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/sanitize-untrusted-html/guide.md#L72-L110). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
