[Complete example](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/security/restrict-outbound-connections.md#L21-L134). Related sections: [Response headers and fetch](response-headers-and-fetch.md).
# Restrict outbound network connections with Connection Allowlists

The `Connection-Allowlist` HTTP response header restricts a document or worker to communicating only with an explicit list of network endpoints. Unlike Content Security Policy (CSP)—which requires maintaining separate per-resource directives (`connect-src`, `img-src`, `script-src`, `font-src`, `form-action`) and does not govern speculative or non-Fetch network channels such as `<link rel="dns-prefetch">`, `<link rel="preconnect">`, or WebRTC—`Connection-Allowlist` enforces a single, network-layer allowlist across **all** outbound connections initiated by the context (`fetch()`, `XMLHttpRequest`, subresources, `navigator.sendBeacon()`, `<a ping>`, top-level and frame navigations, resource hints, Speculation Rules, `WebSocket`, `WebTransport`, and WebRTC).

## How to implement

1. **Serialize the allowlist as an RFC 9651 Inner List `(...)`**: Format `Connection-Allowlist` (or `Connection-Allowlist-Report-Only`) as a single parenthesized list of space-separated items. Include the unquoted token `response-origin` to permit the document or worker's own origin, followed by double-quoted `URLPattern` strings for every legitimate external endpoint the context connects or navigates to (APIs, image/font CDNs, and outbound `<a href>`, `<form action>`, OAuth, or payment redirect targets). When building patterns dynamically from configuration or `URL` objects, normalize `ws:`/`wss:` to `http:`/`https:` and strip bare trailing slashes on origin-only URLs (because `new URL('https://api.example.com').href` appends `/`, which restricts `URLPattern` matching to the root path `/` only).
2. **Scope middleware by `Sec-Fetch-Dest` and cover workers**: Browsers only honor `Connection-Allowlist` on document/navigation responses and worker script responses (`Sec-Fetch-Dest` values `document`, `iframe`, `worker`, `sharedworker`, and `serviceworker`). When varying headers by `Sec-Fetch-Dest`, include `Vary: Sec-Fetch-Dest` so shared caches do not serve headerless responses. Serve a matching allowlist on Dedicated and Shared Worker scripts so compromised page scripts cannot exfiltrate data via `worker.postMessage()`. Because a Service Worker performs its own network fetches on cache misses and navigation preloads, configure its `Connection-Allowlist` as a **superset** of the allowlists of all documents it controls.
3. **Always configure violation reporting (`Reporting-Endpoints` and `report-to`) and support staged or dual rollout**: Define a `Reporting-Endpoints` header and append an unquoted `; report-to=<endpoint-name>` parameter after the closing `)` on every `Connection-Allowlist` or `Connection-Allowlist-Report-Only` policy so blocked connection attempts are observable. You can send `Connection-Allowlist-Report-Only` alone during initial rollout, or send **both** `Connection-Allowlist` (enforcing a baseline allowlist) and `Connection-Allowlist-Report-Only` (auditing a stricter candidate allowlist) on the same response. Violation reports are delivered with `"type": "connection-allowlist"` and body `{ url, connection, allowlist, disposition }` (where `connection` is the blocked destination URL or `"webrtc"`, and `disposition` is `"enforce"` or `"report"`).
4. **Account for default redirect and WebRTC blocking, and handle client errors**: By default, `Connection-Allowlist` blocks all `3xx` HTTP redirects (`redirects=block`, even when redirecting between allowlisted or same-origin URLs) and all `RTCPeerConnection` traffic (`webrtc=block`). Append `; redirects=allow` only when trusted endpoints require server-side redirects (the initial request must still match the allowlist), or `; webrtc=allow` when WebRTC is required. On the client, wrap outbound `fetch()` calls in `try...catch` and handle `WebSocket` `error` events so requests rejected with `TypeError` (`net::ERR_NETWORK_ACCESS_REVOKED`) return a handled error state and update UI status instead of causing unhandled rejections.

## Example code

```http
Vary: Sec-Fetch-Dest
Reporting-Endpoints: conn-reports="https://app.example.com/api/security-reports"
Connection-Allowlist: (response-origin "https://api.example.com" "https://realtime.example.com" "https://*.cdn.example.com/*"); report-to=conn-reports
Connection-Allowlist-Report-Only: (response-origin "https://api.example.com/v2/*"); report-to=conn-reports
```

```javascript
const ALLOWLIST_DESTS = new Set(['document', 'iframe', 'worker', 'sharedworker', 'serviceworker']);

// Normalize a config URL or URLPattern string for Connection-Allowlist:
// - Rewrites ws:// and wss:// to http:// and https:// (WebSocket matching rule).
// - Strips a bare trailing slash on origin-only URLs (e.g. from new URL(...).href)
//   so all subpaths on the origin are permitted instead of only "/".
export function normalizeAllowlistPattern(rawPattern) {
  const trimmed = String(rawPattern).trim().replace(/^ws(s?):\/\//i, 'http$1://');
  if (!/^https?:\/\//i.test(trimmed)) {
    throw new Error(`Pattern must include an http:// or https:// scheme: ${rawPattern}`);
  }
  if (/[\s,]/.test(trimmed)) {
    throw new Error(`Pattern must be a single URLPattern without spaces or commas: ${rawPattern}`);
  }
  if (/[()]/.test(trimmed)) {
    throw new Error(`Custom regex groups are rejected by Connection-Allowlist: ${rawPattern}`);
  }
  return trimmed.replace(/^(https?:\/\/[^/?#]+)\/$/i, '$1');
}

// Build an RFC 9651 Inner List value for Connection-Allowlist or Connection-Allowlist-Report-Only.
export function buildConnectionAllowlistHeader({
  allowSelf = true,
  patterns = [],
  reportTo,
  redirects = 'block',
  webrtc = 'block',
} = {}) {
  const items = allowSelf ? ['response-origin'] : [];
  for (const pattern of patterns) {
    const raw = String(pattern).trim();
    if (raw === 'response-origin') {
      if (!items.includes('response-origin')) items.push('response-origin');
      continue;
    }
    const normalized = normalizeAllowlistPattern(raw);
    items.push(`"${normalized.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`);
  }
  let header = `(${items.join(' ')})`;
  if (redirects === 'allow') header += '; redirects=allow';
  if (webrtc === 'allow') header += '; webrtc=allow';
  if (reportTo) {
    const endpointToken = String(reportTo).trim().replace(/^"+|"+$/g, '');
    header += `; report-to=${endpointToken}`;
  }
  return header;
}

```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/security/restrict-outbound-connections.md#L1-L69). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
