[Complete example](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/security/restrict-outbound-connections.md#L21-L134). Related sections: [Restrict outbound connections](overview.md) · [Fallback strategy](fallback-strategy.md).
```javascript
// Server or middleware helper applying Connection-Allowlist and Reporting-Endpoints
// on document and worker responses.
export function setConnectionAllowlistHeaders(res, options = {}) {
  const {
    secFetchDest = 'document',
    patterns = ['https://api.example.com', 'https://realtime.example.com', 'https://*.cdn.example.com/*'],
    reportOnlyPatterns,
    reportEndpointName = 'conn-reports',
    reportEndpointUrl = 'https://app.example.com/api/security-reports',
    redirects = 'block',
    webrtc = 'block',
    reportOnly = false,
  } = options;

  const setHeader = (name, value) =>
    typeof res.setHeader === 'function' ? res.setHeader(name, value) : res.headers.set(name, value);

  if (typeof res.appendHeader === 'function') {
    res.appendHeader('Vary', 'Sec-Fetch-Dest');
  } else if (typeof res.headers?.append === 'function') {
    res.headers.append('Vary', 'Sec-Fetch-Dest');
  } else {
    setHeader('Vary', 'Sec-Fetch-Dest');
  }
  if (secFetchDest && !ALLOWLIST_DESTS.has(String(secFetchDest).toLowerCase())) return;

  setHeader('Reporting-Endpoints', `${reportEndpointName}="${reportEndpointUrl}"`);
  setHeader(
    reportOnly ? 'Connection-Allowlist-Report-Only' : 'Connection-Allowlist',
    buildConnectionAllowlistHeader({ allowSelf: true, patterns, reportTo: reportEndpointName, redirects, webrtc }),
  );

  if (!reportOnly && Array.isArray(reportOnlyPatterns)) {
    setHeader(
      'Connection-Allowlist-Report-Only',
      buildConnectionAllowlistHeader({
        allowSelf: true,
        patterns: reportOnlyPatterns,
        reportTo: reportEndpointName,
        redirects,
        webrtc,
      }),
    );
  }
}

// Client-side helper that catches blocked outbound requests gracefully without unhandled rejections.
export async function fetchWithPolicyHandling(url, { statusElement, ...fetchOptions } = {}) {
  try {
    const response = await fetch(url, fetchOptions);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const body = await response.text();
    if (statusElement) {
      statusElement.textContent = `Allowed: Loaded ${url} (${body.length} bytes).`;
    }
    return { ok: true, body, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (statusElement) {
      statusElement.textContent = `Blocked: Request to ${url} was rejected by the outbound connection policy (${message}).`;
    }
    return { ok: false, body: null, error };
  }
}
```

## Best practices

- **DO** format `Connection-Allowlist` as a single RFC 9651 Inner List `(...)` of space-separated items. If a non-empty `Connection-Allowlist` header fails top-level Structured Field parsing (for example, omitting `(...)` or using single quotes `'...'`), the browser fails closed with an empty allowlist and blocks **all** outbound network connections. Use `Connection-Allowlist: ()` when you intentionally want to revoke all network access after load (local schemes `data:`, `blob:`, `about:`, and `filesystem:` remain permitted).
- **DO** omit the trailing slash on origin-wide URL patterns (`"https://api.example.com"`) or use an explicit wildcard (`"https://api.example.com/*"`) so subpaths like `/v1/users` are permitted. Strip trailing slashes added by `new URL(origin).href` before serializing patterns.
- **DO** allowlist `WebSocket` (`ws://` and `wss://`) endpoints using `"http://..."` and `"https://..."` patterns in `Connection-Allowlist`, because the browser normalizes WebSocket schemes to HTTP/HTTPS before matching.
- **DO** include expected external navigation targets (`<a href>`, `<form action>`, OAuth/SSO providers, payment checkouts) in a restricted document's allowlist, and remember that the default `redirects=block` blocks even same-origin `3xx` redirects unless `; redirects=allow` is specified.
- **DO NOT** wrap `response-origin` or inner-list parameter values (`; report-to=conn-reports`, `; redirects=allow`, `; webrtc=allow`) in quotes, or separate items inside `(...)` with commas.
- **DO NOT** use custom regular expression groups such as `(\d+)` or relative paths such as `"/api/*"` inside URL patterns; the browser's network-service parser rejects regex groups and patterns without a scheme and hostname.
- **DO NOT** rely on the experimental `<iframe connectionAllowlist="...">` attribute or `Allow-Connection-Allowlist-From` embedded enforcement header in production yet, as embedded enforcement is not enabled by default in shipping browsers.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/security/restrict-outbound-connections.md#L70-L145). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
