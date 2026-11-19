#### 3.1 Analyzing CSP Reports

When reviewing CSP violation reports, first separate the noise (per §2.2) from legitimate application issues. For violations that appear to be caused by an incompatibility in your application (usually those where the "Sample" or "Blocked URI" seem like legitimate scripts or assets that might be present in your markup):
- **Code Search**: Search your codebase for the offending script source, URL, or hash to see if it is present in your code, dynamic server templates, or static HTML files.
- **Console Auditing**: Open the page that triggered the violation (the "Document URI" in the report) using the same browser, and check the developer tools/console for CSP violations while exercising as much application functionality as possible (some violations only trigger on specific user interactions).

Once filtered and triaged, analyze the reports against the following common scenarios:

- **Scenario**: Many violations for inline scripts.
  - **Condition**: The app uses a framework that relies on inline scripts.
  - **Decision**: Implement Nonces (server-rendered) or Hashes (static) before enforcing.
- **Scenario**: Violations for third-party analytics scripts.
  - **Condition**: The scripts are required.
  - **Decision**: Use `'strict-dynamic'` with a per-request nonce so the analytics loader can attach its dependencies. Do **not** add the analytics origin to a URL allowlist — domain allowlists are bypassable via open redirects, JSONP, and dependency injection on the listed origin.
- **Scenario**: Trusted Types violations on specific sinks.
  - **Condition**: Legacy code paths still write strings to `innerHTML` etc.
  - **Decision**: Refactor those sinks (per §1.2) or route them through a Trusted Types policy (§3.3) before enforcing.

#### 3.2 Enforcing Content Security Policy (CSP)
When enforcing `Content-Security-Policy`, always keep `Reporting-Endpoints` and `report-to` wired up on the enforced header so any regressions remain visible.

**Mandatory directives to set:**
- `script-src 'nonce-{RANDOM}' 'strict-dynamic' 'report-sample'` (or SHA-256/384/512 script hashes for static HTML) — the core directive of any CSP and the primary mechanism to prevent XSS.
- `object-src 'none'` — blocks plugin-based code execution (`<object>`, `<embed>`).
- `base-uri 'none'` — blocks `<base>` tag hijacking of relative URLs.
- `frame-ancestors 'none'` (or `'self'` when same-origin framing is needed) — prevents clickjacking alongside `X-Frame-Options: DENY` (or `SAMEORIGIN`; see §1.4).
- `require-trusted-types-for 'script'` — enforces Trusted Types runtime checks on DOM XSS sinks (§3.3).
- `report-to <endpoint>` — sends violation reports to the endpoint defined in `Reporting-Endpoints`.
- *Optional*: `form-action 'self'` prevents form submissions to attacker-controlled origins.

**Enforced Header Example (CSP with reporting):**
```http
Reporting-Endpoints: main-endpoint="https://reports.example/main"
Content-Security-Policy: script-src 'nonce-{RANDOM}' 'strict-dynamic' 'report-sample'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; require-trusted-types-for 'script'; report-to main-endpoint;
```

HTML for nonce-based CSP:
```html
<script nonce="{RANDOM}" src="https://example.com/script.js"></script>
```

**Server / Middleware Per-Request Nonce Generation:**
In server-rendered or SSR middleware (such as Node.js, Express, or Astro middleware), generate a fresh cryptographic nonce on every request, attach it to `Content-Security-Policy`, and pass the nonce into your template/SSR rendering context so only trusted template `<script>` tags receive it:

```javascript
const bytes = new Uint8Array(16);
crypto.getRandomValues(bytes);
const nonce = btoa(String.fromCharCode(...bytes));

const csp = [
  `script-src 'nonce-${nonce}' 'strict-dynamic' 'report-sample'`,
  "object-src 'none'",
  "base-uri 'none'",
  "frame-ancestors 'none'", // or "frame-ancestors 'self'" if same-origin framing is needed
  "require-trusted-types-for 'script'",
  'report-to main-endpoint',
].join('; ');

headers.set('Reporting-Endpoints', 'main-endpoint="https://reports.example/main"');
headers.set('Content-Security-Policy', csp);

// Pass the per-request nonce into your template/SSR rendering context (or replace an
// explicit placeholder token in a static template before interpolating any user data):
res.locals.nonce = nonce; // e.g., <script nonce="<%= nonce %>" src="/app.js"></script>
```

For static/cached HTML (SPAs) where a per-response nonce is not possible, use hash-based CSP: compute the `sha256-` hash of each script and list the hashes in `script-src` alongside `'strict-dynamic' 'report-sample'`.

**Avoid**:
- Broad scheme or domain allowlists (such as `https:` alone or `script-src https://cdn.example.com` without `'strict-dynamic'`) as the primary `script-src` protection — they are easily bypassed by open redirects, JSONP endpoints, and dependency injection on the allowed origin.
- Rewriting already-rendered HTML with a regular expression (such as `html.replace(/<script\b.../gi, ...)`) to stamp CSP nonces onto every `<script>` tag — post-processing rendered HTML cannot distinguish developer-authored `<script>` tags from untrusted `<script>` tags introduced via reflected or stored HTML injection, authorizing attacker-injected scripts under `script-src 'nonce-...'`.

#### 3.3 Trusted Types Enforcement
Trusted Types enforces source-level guidance at runtime by blocking raw string assignments to dangerous DOM XSS sinks (`innerHTML`, `outerHTML`, `document.write`, `script.src`, `script.textContent`) unless they pass through a named policy.

- **DO**: Enforce Trusted Types in your `Content-Security-Policy` header by including the `require-trusted-types-for 'script'` directive.
- **DO**: Sanitize any HTML sink assignments through a named `trustedTypes.createPolicy(...)` instance rather than assigning raw strings (or prefer `element.setHTML()` directly, which sanitizes HTML without needing a Trusted Types policy).
- **DO NOT**: Create a pass-through policy (such as `createHTML: (s) => s`) that returns unsanitized input unchanged, as this neutralizes Trusted Types protection.
- **DO**: Consult the dedicated `trusted-types` (via `npx -y modern-web-guidance@latest retrieve "trusted-types"`) guide for full implementation details, including `trusted-types` policy allowlisting and rollout strategies.

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


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/security/security.md#L184-L276). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
