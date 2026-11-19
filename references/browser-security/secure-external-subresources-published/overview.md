# Secure external subresources with Subresource Integrity, CORS, and Referrer Policy

When loading scripts, stylesheets, fonts, or images from third-party CDNs or external origins, verify their cryptographic integrity with Subresource Integrity (`integrity` in HTML and `integrity()` in CSS `url()`), configure cross-origin credential handling (`crossorigin` and `cross-origin()`), and restrict outgoing `Referer` headers (`referrerpolicy` and `referrer-policy()`). For document-level Content Security Policy and outbound connection allowlists, see `security` (via `npx -y modern-web-guidance@latest retrieve "security"`) and `restrict-outbound-connections` (via `npx -y modern-web-guidance@latest retrieve "restrict-outbound-connections"`).

## 1. Generate cryptographic integrity digests for immutable assets

Subresource Integrity (SRI) ensures the browser only executes or renders an external asset if its bytes match the cryptographic hash declared by your application.

- **Compute digests at build or release time, never from live untrusted responses**: Generate integrity hashes during your build or release step from known-good local asset bytes (or copy the official digest published by the package author) and hardcode them into your HTML, CSS, or JavaScript. Never fetch a third-party URL in the browser at runtime to compute its own `integrity` hash, which trusts whatever bytes the remote server returns and defeats SRI.
- **Use `sha384-` by default**: Format integrity metadata as `<algorithm>-<base64-digest>` using `sha384-` (recommended default), `sha512-`, or `sha256-`.
- **Pin external subresources to immutable, versioned URLs**: Always reference third-party assets using immutable, version-pinned or content-addressed URLs (such as `https://cdn.example.com/ui@2.4.0/app.min.js`) rather than mutable floating URLs (`latest/app.min.js`), which expose your site to silent supply-chain changes and break SRI as soon as the remote file updates. If you must load a mutable third-party script that updates in place (such as a vendor analytics tag), omit `integrity` on that URL and restrict it with Content Security Policy (`strict-dynamic` / nonces) or iframe sandboxing instead.
- **Space-separate multiple digests when an endpoint may serve multiple valid payloads**: All browsers that support SRI implement `sha256-`, `sha384-`, and `sha512-`. If a URL may legitimately return one of several known-good payloads (such as during an A/B test, staged CDN rollout, or content-negotiated build), list multiple digests of the same algorithm separated by whitespace (for example, `integrity="sha384-variantA... sha384-variantB..."`). The browser accepts the response if it matches *any* listed digest of the strongest algorithm present.
- **Serve cross-origin subresources with CORS headers**: Browsers can only verify the integrity of a cross-origin response when it is CORS-readable (`Access-Control-Allow-Origin: *` for anonymous requests, or the exact requesting origin with `Access-Control-Allow-Credentials: true` for credentialed requests).

```bash
# Generate a sha384- SRI hash at build time from a known-good local file
printf "sha384-%s\n" "$(openssl dgst -sha384 -binary app.min.js | openssl base64 -A)"
```

```javascript
// Build-time / tooling helper (Node.js 19+, Deno, Bun) to compute an SRI string from known-good local bytes
export async function computeIntegrityMetadata(bytes) {
  const rawBytes =
    typeof bytes === 'string' ? new TextEncoder().encode(bytes) : bytes;
  const digestBuffer = await crypto.subtle.digest('SHA-384', rawBytes);
  const binary = Array.from(new Uint8Array(digestBuffer), (b) =>
    String.fromCharCode(b),
  ).join('');
  return `sha384-${btoa(binary)}`;
}
```

## 2. Secure HTML scripts, stylesheets, and preloads

Set a document-level `Referrer-Policy: strict-origin-when-cross-origin` HTTP response header (or include `<meta name="referrer" content="strict-origin-when-cross-origin">` in `<head>`) as a baseline default so any subresource or CSS `url()` that omits a per-request referrer modifier still strips sensitive path and query parameters on cross-origin requests.

Then, on external `<script>`, `<link rel="stylesheet">`, `<link rel="preload">`, and `<link rel="modulepreload">` elements, always set `integrity`, `crossorigin`, and `referrerpolicy` together:

- **`integrity="sha384-..."`**: Blocks execution or application of the resource if the response bytes do not match the expected digest (for a blocked `<link rel="stylesheet">`, `linkElement.sheet` remains `null` and an `error` event fires).
- **`crossorigin="anonymous"`** (recommended default for public CDN assets) or **`crossorigin="use-credentials"`**: Required whenever `integrity` is set on a cross-origin resource. Omitting `crossorigin` causes the browser to fetch the resource in `no-cors` mode (producing an opaque response that cannot be hash-verified) and block the resource.
- **`referrerpolicy="no-referrer"`** (recommended default for third-party CDNs) or **`referrerpolicy="strict-origin-when-cross-origin"`**: Overrides the document referrer policy to prevent leaking any origin or path information in the `Referer` request header to the third-party host.

```html
<!-- Document-level baseline referrer policy in <head> (or via Referrer-Policy HTTP header) -->
<meta name="referrer" content="strict-origin-when-cross-origin" />

<!-- External stylesheet with SRI, anonymous CORS, and no referrer -->
<link
  rel="stylesheet"
  href="https://cdn.example.com/ui@2.4.0/styles.css"
  integrity="sha384-bs0EksOYBbU/g0IAHMXbSyH1Mgw83GKn+EZlSI+VE+zVchXmSbLwhVLrPzsOWnc5"
  crossorigin="anonymous"
  referrerpolicy="no-referrer"
/>

<!-- External script with SRI, anonymous CORS, and no referrer -->
<script
  src="https://cdn.example.com/ui@2.4.0/bundle.min.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  crossorigin="anonymous"
  referrerpolicy="no-referrer"
></script>
```

When fetching external subresources programmatically with `fetch()`, pass the matching `integrity`, `mode`, `credentials`, and `referrerPolicy` options (a digest mismatch rejects the promise with `TypeError`):

```javascript
const response = await fetch('https://cdn.example.com/ui@2.4.0/manifest.json', {
  integrity: 'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC',
  mode: 'cors',
  credentials: 'omit',
  referrerPolicy: 'no-referrer',
});
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/security/secure-external-subresources.md#L1-L75). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
