### Option 3: srcdoc Attribute

```js
const iframe = document.getElementById('preview');
iframe.srcdoc = `
  <!DOCTYPE html>
  <style>${cssCode}</style>
  ${htmlCode}
  <script>${jsCode}<\/script>
`;
```

Both blob URLs and srcdoc create a separate origin, so they bypass the extension's CSP.
However, they also cannot access chrome.* APIs, and you cannot access their DOM directly
from the extension page (same cross-origin restriction as sandbox).

### What NOT to Do

```js
// ❌ WILL FAIL: Trying to set iframe content directly
iframe.contentDocument.open();
iframe.contentDocument.write(html);
iframe.contentDocument.close();

// ❌ WILL FAIL: Accessing cross-origin sandbox DOM
const doc = iframe.contentWindow.document;
doc.body.innerHTML = html;

// ❌ WILL FAIL: eval in a normal extension page
eval(userCode); // CSP blocks this
```

## CSP for Remote Resources

Extension pages cannot load remote scripts by default. If you need external libraries:

1. **Bundle them** — download and include in your extension
2. **Use chrome.scripting to inject into web pages** — web pages have their own CSP

For content scripts injected into web pages, the web page's CSP does NOT apply to the
content script's own code. Content scripts run in an isolated world.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/skills-src/chrome-extensions/references/extensions/csp-sandbox.md#L137-L177). [Upstream licensing terms](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/README.md#license). Reorganized for this edition.
