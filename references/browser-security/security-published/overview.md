# Web Security

Guidelines for implementing preventative security measures on the web safely and incrementally.

**NOTE**: This skill covers standard web platform defenses, focusing mostly on the browser. Applications still require comprehensive server-side security, authorization models, and input validation.

## Table of Contents

- When to apply this skill
- Phase 1: Quick Wins & Obvious Anti-Patterns
  - 1.1 Secure Contexts
  - 1.2 Avoid Dangerous DOM Sinks
  - 1.3 Secure Cookies
  - 1.4 Clickjacking Protection (Frame-Ancestors & X-Frame-Options)
  - 1.5 Secure Window Messaging (postMessage)
- Phase 2: Discovery & Data Collection (Prerequisites)
  - 2.1 Inspect the Application
  - 2.2 Deploy Report-Only Policies
  - 2.3 Data Hygiene for Reports
  - 2.4 Automated Discovery via Browser APIs and DevTools
- Phase 3: Interpreting Results & Enforcement
  - Core enforcement
    - 3.1 Analyzing CSP Reports
    - 3.2 Enforcing Content Security Policy (CSP)
    - 3.3 Trusted Types Enforcement
    - 3.4 Cross-Origin Opener Policy (COOP)
    - 3.5 Cross-Origin Resource Policy (CORP)
    - 3.6 Cross-Origin Isolation
    - 3.7 Fetch Metadata (Resource Isolation)
  - Companion policies (deploy in parallel)
    - HTTP Strict Transport Security (HSTS)
    - X-Content-Type-Options
    - Referrer Policy
    - Permissions Policy
    - Subresource Integrity (SRI)
    - Cross-Origin Resource Sharing (CORS)
    - Clear-Site-Data (Logout)

## When to apply this skill

The right starting point depends on the application and whether you can update the codebase directly:

- **Auditing and hardening a codebase directly**: Apply Phase 1 code hygiene, wire up Phase 2 reporting (`Reporting-Endpoints` and `report-to`), and enforce Phase 3 headers (`Content-Security-Policy` with nonces/hashes, `'strict-dynamic'`, `'report-sample'`, `object-src 'none'`, `base-uri 'none'`, `frame-ancestors 'none'` (or `'self'`), and `require-trusted-types-for 'script'`, plus COOP, CORP, Fetch Metadata, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`) directly by updating `<script>` tags, cookies, and server middleware in the same pass.
- **Staged rollout on a large production site with unknown third-party dependencies**: Start with Phase 1 quick wins and deploy Phase 2 report-only headers alongside enforced companion policies while collecting violation telemetry, then promote the report-only policies to Phase 3 enforcement.
- **Greenfield app or SaaS template / framework defaults**: Ship Phase 1 hygiene and Phase 3 enforced policies by default, with Phase 2 reporting configured so regressions are captured immediately.

**Focusing on Leverage**: While Phase 1 and 2 establish baseline hygiene and violation visibility, Phase 3 core enforcement represents the highest-leverage security work. Specifically, Injection/XSS mitigation through enforced CSP (§3.2) and Trusted Types (§3.3) addresses the largest practical threat, while companion policies and isolation defenses provide important defense-in-depth.

## Phase 1: Quick Wins & Obvious Anti-Patterns

Before attempting to deploy global security policies, focus on code-level hygiene and immediate fixes that do not risk breaking the application.

### 1.1 Secure Contexts
- **DO**: Deliver resources over HTTPS to protect against both passive and active network attackers.
- **DO**: Serve a header like `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` to force HTTPS whenever possible.
- **TIP**: In production rollout, start with a short `max-age` (e.g., 300 seconds) and incrementally increase to 1 year. A misconfigured HSTS with a long max-age can render the site permanently inaccessible until the cache expires in every browser that saw it.

### 1.2 Avoid Dangerous DOM Sinks
- **DO**: Prefer `textContent` or `innerText` over `innerHTML` when setting text content.
- **DO**: Use `setHTML()` (part of the Sanitizer API; see `sanitize-untrusted-html` (via `npx -y modern-web-guidance@latest retrieve "sanitize-untrusted-html"`)) when available to safely insert untrusted HTML without going through `innerHTML`.
- **DO NOT**: Use `innerHTML` or `setHTMLUnsafe` with untrusted or unsanitized input.
- **DO**: Use DOMParser or create elements programmatically (`document.createElement`) instead of concatenating HTML strings.

**Dangerous sinks to grep for**: `innerHTML`, `outerHTML`, `document.write`, `eval`, `setTimeout` with a string argument, `script.src`.

**Code Pattern:**
```javascript
// Unsafe
element.innerHTML = `Hello, ${untrustedName}!`;

// Safe
element.textContent = `Hello, ${untrustedName}!`;
```

Trusted Types can enforce this pattern at runtime by blocking string assignments to dangerous sinks. Deploying it is a CSP enforcement step with real breakage risk — see §3.3.

### 1.3 Secure Cookies
Ensure session and application cookies are configured securely by default, whether set via `Set-Cookie` headers or framework session configuration (such as Astro or Express session middleware).
- **DO**: Name first-party session cookies with the `__Host-` prefix (`name: '__Host-session'`) when used by a single domain. This requires `Secure` (`secure: true`), `Path=/` (`path: '/'`), and omitting the `Domain` attribute, protecting against same-site and network attackers.
- **DO**: Prefer naming cookies with the `__Secure-` prefix when `__Host-` isn't appropriate. This requires the `Secure` attribute, and protects against network attackers.
- **DO**: Set `HttpOnly` (`httpOnly: true`) on session and authentication cookies so they cannot be read by injected client-side scripts, and explicitly set `SameSite=Lax` (`sameSite: 'lax'`) for standard first-party cookies.
- **DO**: If your application will be embedded as an iframe in third-party contexts, use `SameSite=None; Secure; Partitioned`.
- **DO NOT**: Rely on unpartitioned `SameSite=None` — these are being systematically blocked for tracking prevention.

```http
Set-Cookie: __Host-session_id=value; SameSite=Lax; HttpOnly; Secure; Path=/
Set-Cookie: third_party_var=value; SameSite=None; Secure; Partitioned
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/security/security.md#L1-L89). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
