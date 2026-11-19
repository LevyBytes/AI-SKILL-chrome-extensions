Related section: [Trusted types](overview.md).
### 4. Enforcing Trusted Types with CSP

Trusted Types should be rolled out incrementally to avoid breaking your application. While full enforcement provides the strongest protection, it carries a risk of site breakage if every sink write hasn't been migrated.

#### Prerequisites

- **Framework cooperation**: If your application's framework (or any third-party library that writes to DOM sinks) does not produce `TrustedHTML` or `TrustedScript` values, you cannot enforce Trusted Types without breaking that code. Audit framework support before starting the rollout.
- **Sink refactoring**: Ensure you have identified and refactored dangerous sinks to use your Trusted Types policies.

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

{{ BASELINE_STATUS("trusted-types") }}

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

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/trusted-types/guide.md#L92-L147). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
