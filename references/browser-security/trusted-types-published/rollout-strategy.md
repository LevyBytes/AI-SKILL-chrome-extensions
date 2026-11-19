Related section: [Trusted types](overview.md).
#### Rollout Strategy

1.  **Report-Only**: First, roll out using the `Content-Security-Policy-Report-Only` header. This will log violations to your reporting endpoint without actually blocking the writes.
    ```http
    Content-Security-Policy-Report-Only: require-trusted-types-for 'script';
    ```
2.  **Enforcement**: Once you have integrated your policies and violation reports drop to zero, move to full enforcement.

    ```http
    Content-Security-Policy: require-trusted-types-for 'script';
    ```

You can also restrict which policies are allowed to be created (list your policy names such as `sanitize-html` or `escape-html`, include `dompurify` if your policy delegates to `DOMPurify.sanitize()`—which internally creates a `dompurify` policy—and include `default` if you register a default policy during migration):

```http
Content-Security-Policy: require-trusted-types-for 'script'; trusted-types sanitize-html escape-html dompurify;
```

With this CSP in place, any writes to a sink that don't use Trusted Types will throw an error. In addition, attempting to create a Trusted Type policy with a name not listed in `trusted-types` will throw an error.

You can also set this CSP as a `<meta>` tag in your document's `<head>`, although this is potentially less secure.

```html
<!-- First child of `<head>`, as earlier tags will not enforce this CSP. -->
<meta
  http-equiv="Content-Security-Policy"
  content="require-trusted-types-for 'script'; trusted-types sanitize-html escape-html dompurify;"
/>
```

## Fallback strategies

Baseline status for Trusted types: Newly available. It's been Baseline since 2026-02-24.
Supported by: Chrome 83 (May 2020), Edge 83 (May 2020), Firefox 148 (Feb 2026), and Safari 26 (Sep 2025).

For browsers that do not yet support Trusted Types, you can use a minimal "tinyfill" to ensure your code doesn't break while still providing sanitization.

```javascript
if (!window.trustedTypes) {
  window.trustedTypes = {
    createPolicy: (name, rules) => rules,
  };
}
```

This allows you to write your code using the Trusted Types pattern today. Supporting browsers will enforce the types, while older browsers will still execute your sanitization logic via the mock policy.

If a browser doesn't support Trusted Types, it will simply treat the `TrustedHTML` objects as strings (if using the tinyfill) or won't have the enforcement check at the sink level.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/security/trusted-types.md#L94-L141). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
