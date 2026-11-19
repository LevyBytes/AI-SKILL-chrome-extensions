## Fallback strategy

{{ BASELINE_STATUS("origin") }}

If your Baseline target includes browsers that do not yet support the `Origin` interface, feature-detect `'Origin' in globalThis` and fall back to parsing URLs with `new URL()`:

- **Same-origin fallback (tuple origins):** Extract the URL string (using `event.origin` for `MessageEvent` objects or `candidate.href` for link elements), parse both the candidate and trusted URLs with `new URL()`, reject `"null"` opaque origins (`candidateUrl.origin !== 'null'`), and compare `candidateUrl.origin === trustedUrl.origin`. Because an opaque origin is never same-origin with a tuple origin like `'https://app.example.com'`, immediately rejecting `'null'` matches `Origin.isSameOrigin()`.
- **Same-site fallback (caveat):** The `URL` interface does not expose the browser's Public Suffix List. In browsers without `Origin`, only perform suffix matching against an explicit, known private registrable domain that you control (verifying both `protocol` and an exact or dot-prefixed `hostname` match), or use a maintained Public Suffix List library.
- **Opaque / sandboxed iframe fallback:** Browsers without `Origin` do not expose distinct opaque origin identities on `MessageEvent` (`event.origin` is always `"null"`). If you intentionally accept messages from a known sandboxed `<iframe sandbox="allow-scripts">`, verify `event.source === expectedWidgetWindow` (or communicate over a dedicated `MessageChannel` `MessagePort` transferred to the iframe on initialization) rather than comparing `event.origin`.

```javascript
// Replace with your trusted reference URL and known registrable domain
const TRUSTED_URL = 'https://app.example.com';
const TRUSTED_SITE_DOMAIN = 'example.com';

function extractUrlString(candidate) {
  if (typeof candidate === 'string') return candidate;
  if (typeof MessageEvent !== 'undefined' && candidate instanceof MessageEvent) {
    return candidate.origin;
  }
  if (candidate === globalThis) {
    return globalThis.location?.href ?? '';
  }
  return candidate?.href ?? '';
}

function extractOrigin(candidate) {
  try {
    return Origin.from(candidate);
  } catch (err) {
    if (typeof MessageEvent !== 'undefined' && candidate instanceof MessageEvent) {
      return Origin.from(candidate.origin);
    }
    throw err;
  }
}

export function checkSameOriginWithFallback(candidate) {
  try {
    if ('Origin' in globalThis) {
      return extractOrigin(candidate).isSameOrigin(Origin.from(TRUSTED_URL));
    }
    const candidateUrl = new URL(extractUrlString(candidate));
    const trustedUrl = new URL(TRUSTED_URL);
    return candidateUrl.origin !== 'null' && candidateUrl.origin === trustedUrl.origin;
  } catch {
    return false;
  }
}

export function checkSameSiteWithFallback(candidate) {
  try {
    if ('Origin' in globalThis) {
      return extractOrigin(candidate).isSameSite(Origin.from(TRUSTED_URL));
    }
    const candidateUrl = new URL(extractUrlString(candidate));
    const trustedUrl = new URL(TRUSTED_URL);
    return (
      candidateUrl.origin !== 'null' &&
      candidateUrl.protocol === trustedUrl.protocol &&
      (candidateUrl.hostname === TRUSTED_SITE_DOMAIN ||
        candidateUrl.hostname.endsWith(`.${TRUSTED_SITE_DOMAIN}`))
    );
  } catch {
    return false;
  }
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/validate-origins/guide.md#L135-L202). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
