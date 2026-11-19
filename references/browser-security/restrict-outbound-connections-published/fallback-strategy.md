## Fallback strategy

Browser support for Connection allowlists: Limited availability.
Supported by: Chrome 152 (Aug 2026) and Edge 152 (Aug 2026).
Unsupported in: Firefox and Safari.

Because `Connection-Allowlist` is enforced at the browser network layer via an HTTP response header, it cannot be polyfilled in client-side JavaScript. If your Baseline target includes browsers that do not yet support `Connection-Allowlist`, **pair `Connection-Allowlist` with a `Content-Security-Policy` (CSP) header** (and a `<meta http-equiv="Content-Security-Policy">` element for document-level fetch and subresource restrictions when HTTP response headers cannot be configured):

- **Additive defense-in-depth**: Supporting browsers enforce both policies simultaneously—`Connection-Allowlist` blocks non-CSP exfiltration channels (`dns-prefetch`, `preconnect`, WebRTC, and redirects), while CSP restricts `fetch()`, subresources, and `<form action>` navigations in browsers without `Connection-Allowlist`.
- **Cover `form-action` and `worker-src` explicitly**: In CSP, `default-src` does **not** fall back for `<form action>` submissions; always include `form-action` explicitly. Include `worker-src 'self'` (excluding `blob:`) so restricted pages cannot spawn `blob:` SharedWorkers to bypass document-level restrictions.
- **Map allowed origins to per-resource CSP directives**: Unlike `Connection-Allowlist` (which uses a single endpoint list and does not govern inline markup), `default-src 'self'` in CSP restricts each resource type (`connect-src`, `img-src`, `style-src`, `font-src`, `script-src`) and blocks inline `<style>` and `<script>` blocks unless authorized via hashes or nonces.
- **Include `wss://` in CSP `connect-src`**: While `Connection-Allowlist` matches `wss://` connections against `"https://..."` patterns, CSP `connect-src` in cross-browser environments should explicitly list `wss://` origins when WebSockets are used.

```http
Content-Security-Policy: default-src 'self'; connect-src 'self' https://api.example.com https://realtime.example.com wss://realtime.example.com; img-src 'self' https://*.cdn.example.com data: blob:; form-action 'self'; worker-src 'self'; object-src 'none'; base-uri 'self'; report-to conn-reports
```

```html
<!-- Document-level fallback when HTTP response headers cannot be set on static hosting -->
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; connect-src 'self' https://api.example.com https://realtime.example.com wss://realtime.example.com; img-src 'self' https://*.cdn.example.com data: blob:; form-action 'self'; worker-src 'self'; object-src 'none'; base-uri 'self'"
/>
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/security/restrict-outbound-connections.md#L146-L169). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
