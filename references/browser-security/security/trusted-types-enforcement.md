#### 3.3 Trusted Types Enforcement
Trusted Types enforces source-level guidance at runtime by blocking raw string assignments to dangerous DOM XSS sinks (`innerHTML`, `outerHTML`, `document.write`, `script.src`, `script.textContent`) unless they pass through a named policy.

- **DO**: Enforce Trusted Types in your `Content-Security-Policy` header by including the `require-trusted-types-for 'script'` directive.
- **DO**: Sanitize any HTML sink assignments through a named `trustedTypes.createPolicy(...)` instance rather than assigning raw strings (or prefer `element.setHTML()` directly, which sanitizes HTML without needing a Trusted Types policy).
- **DO NOT**: Create a pass-through policy (such as `createHTML: (s) => s`) that returns unsanitized input unchanged, as this neutralizes Trusted Types protection.
- **DO**: Consult the dedicated {{ GUIDE_REF("trusted-types") }} guide for full implementation details, including `trusted-types` policy allowlisting and rollout strategies.

```javascript
const htmlPolicy = window.trustedTypes?.createPolicy('app-html', {
  createHTML(input) {
    return String(input)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },
});
```

#### 3.4 Cross-Origin Opener Policy (COOP)

Lowest-risk of the three. Deploy if the app is **not** an OAuth provider, payment processor, or otherwise expected to be reached from an opener.

- **DO**: Use `Cross-Origin-Opener-Policy: same-origin-allow-popups` — prevents a malicious opener from mounting XS-leaks attacks while still allowing OAuth and payment flows that *the app itself* initiates.
- **DO NOT**: Jump straight to `same-origin` unless you have explicitly verified that no integrations rely on cross-origin `window.opener` access.

#### 3.5 Cross-Origin Resource Policy (CORP)

Set CORP explicitly on each response based on whether it should be embeddable in other contexts. Two core benefits: it protects resources from malicious cross-origin reads, and ensures compatibility when pages request stronger client-side isolation.

- **DO**: Default to `Cross-Origin-Resource-Policy: same-origin` for app-internal responses (such as HTML documents, internal endpoints, authenticated data, user session JSON, and restricted internal scripts).
- **DO**: Use `same-site` for endpoints utilized across subdomains of the same eTLD+1.
- **DO**: Provide `cross-origin` exclusively for resources created for generic embedding or widely cached delivery (e.g., static shared assets or public CDNs).

#### 3.6 Cross-Origin Isolation

Highest deployment breakage risk. You only need to deploy this infrastructure if the application requires features relying on `SharedArrayBuffer` (e.g., WebAssembly multi-threading or shared memory architectures). If not required, skip this policy group.

- **DO (Cross-browser default — COOP + COEP)**: Serve the document with `Cross-Origin-Opener-Policy: same-origin` coupled with `Cross-Origin-Embedder-Policy: require-corp` (or `Cross-Origin-Embedder-Policy: credentialless` where supported). Under `require-corp`, every cross-origin subresource (images, scripts, styles, media) MUST explicitly opt in via either a `Cross-Origin-Resource-Policy` header (`cross-origin` or `same-site`) or CORS (`crossorigin` attribute paired with `Access-Control-Allow-Origin`), and any embedded cross-origin `<iframe>` must both send `Cross-Origin-Resource-Policy` (`cross-origin` or `same-site`) and enforce COEP, or the browser will block it.

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
```

{{ BASELINE_STATUS("document-isolation-policy") }}

- **DO (Alternative where supported — Document-Isolation-Policy)**: Where supported, you can serve `Document-Isolation-Policy: isolate-and-credentialless` on the document requiring `SharedArrayBuffer` to isolate at the document level without severing cross-origin `window.opener` popup references or requiring embedded third-party iframes to deploy COEP, while stripping cookies and credentials from non-CORS cross-origin subresource requests. Use `Document-Isolation-Policy: isolate-and-require-corp` instead if you need to block cross-origin subresources lacking explicit CORP or CORS opt-in.

#### 3.7 Fetch Metadata (Resource Isolation)
Server-side enforcement that uses `Sec-Fetch-*` request headers to reject suspicious cross-site requests. Requires the cross-site integration mapping from §2.1 before enforcing.

- **DO**: Implement a server-side resource isolation policy that checks `Sec-Fetch-*` headers and rejects `cross-site` requests for non-navigational endpoints.
- **DO**: Reject disallowed requests *before* authentication or authorization checks, so the response does not leak timing information about whether a resource or session exists.
- **DO**: Include `Vary: Sec-Fetch-Dest, Sec-Fetch-Mode, Sec-Fetch-Site` to prevent intermediate caches (CDNs) from serving cached responses to attackers.
- **CAUTION**: `same-site` trusts every subdomain under your eTLD+1. If any subdomain hosts user-generated content, a legacy app, or otherwise untrusted code, drop `same-site` from the allowlist and accept only `same-origin` and `none`.
- **CAUTION**: Misconfiguring these checks will block legitimate API requests coming from cross-site integrations, SSO handlers, or Webhooks. Ensure you log and test your `Sec-Fetch-*` constraints beforehand.

```javascript
app.use((req, res, next) => {
  res.setHeader('Vary', 'Sec-Fetch-Dest, Sec-Fetch-Mode, Sec-Fetch-Site');

  const site = req.get('Sec-Fetch-Site');
  const mode = req.get('Sec-Fetch-Mode');
  const dest = req.get('Sec-Fetch-Dest');

  if (!site) return next(); // Fallback for legacy browsers

  if (['same-origin', 'same-site', 'none'].includes(site)) return next();

  // Allow standard navigate GET requests (link clicks)
  if (site === 'cross-site' && mode === 'navigate' && req.method === 'GET' && !['object', 'embed'].includes(dest)) {
    return next();
  }

  res.status(403).send('Forbidden');
});
```

### Companion policies (deploy in parallel)

These carry significantly lower breakage risk than the core enforcement track. They can be deployed alongside — or before — the CSP and isolation rollouts.

#### HTTP Strict Transport Security (HSTS)
- **DO**: `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` to force HTTPS.
- **TIP**: In production rollout, start with a short `max-age` (e.g., 300 seconds) and incrementally increase to 1 year. A misconfigured HSTS with a long max-age can render the site permanently inaccessible until the cache expires in every browser that saw it.

#### X-Content-Type-Options
- **DO**: Set `X-Content-Type-Options: nosniff` to block MIME-type sniffing.
- **DO**: Ensure the server serves correct `Content-Type` headers for all resources (`application/javascript` for scripts, `application/json` for APIs, `text/html` for documents, etc.) so the browser can strictly enforce the `nosniff` constraint.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/security/guide.md#L263-L356). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
