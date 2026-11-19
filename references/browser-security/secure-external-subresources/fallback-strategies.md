## Fallback strategies

{{ BASELINE_STATUS("url-cross-origin") }}

{{ BASELINE_STATUS("url-referrer-policy") }}

{{ BASELINE_STATUS("url-integrity") }}

If your Baseline target does not yet support CSS `url()` request modifiers (`cross-origin()`, `referrer-policy()`, or `integrity()`), combine document-level policies with cascading CSS declarations so subresources remain functional and protected:

1. **Prefer HTML `<link rel="stylesheet">` over CSS `@import` when cross-browser SRI is required**: Because `subresource-integrity` and `referrer-policy` on `<link rel="stylesheet">` are widely available across all browsers, load external stylesheets with `<link rel="stylesheet" href="..." integrity="sha384-..." crossorigin="anonymous" referrerpolicy="no-referrer">` instead of `@import` whenever integrity verification must be enforced in every browser.
2. **Rely on the document-level `Referrer-Policy` header or `<meta name="referrer">` from Step 2**: In browsers that do not support `referrer-policy()` inside CSS `url()`, the document-level `Referrer-Policy: strict-origin-when-cross-origin` header or `<meta name="referrer" content="strict-origin-when-cross-origin">` element automatically strips sensitive path and query parameters on cross-origin CSS requests.
3. **Cascade separate CSS declarations for progressive enhancement**: Browsers that do not recognize a modifier inside `url("..." ...)` discard the entire declaration at CSS parse time. Declare a plain `url("...")` first, followed by a `cross-origin()` and `referrer-policy()` declaration (for browsers that support those two modifiers but not `integrity()`), followed by the full declaration including `integrity("sha384-...")`:
   - **Never put an unverified `url()` inside the same comma-separated `@font-face` `src` list**: Writing `src: url("font.woff2" cross-origin(anonymous) integrity("sha384-...")), url("font.woff2");` in a single `src` descriptor bypasses Subresource Integrity at runtime—if a CDN serves a tampered font that fails the `integrity()` check, the browser treats it as a load failure and automatically falls back to the second comma-separated `url("font.woff2")`. Using **separate** `src:` declarations ensures supporting browsers overwrite the unverified declaration at CSS parse time and block tampered fonts at runtime.

```css
@font-face {
  font-family: "BrandSans";
  /* 1. Parse-time fallback for browsers without url() modifier support */
  src: url("https://cdn.example.com/fonts@1.0.0/brand-sans.woff2") format("woff2");
  /* 2. Parse-time fallback for browsers supporting cross-origin() and referrer-policy() */
  src: url(
    "https://cdn.example.com/fonts@1.0.0/brand-sans.woff2"
    cross-origin(anonymous)
    referrer-policy(no-referrer)
  ) format("woff2");
  /* 3. Full protection in browsers supporting cross-origin(), referrer-policy(), and integrity() */
  src: url(
    "https://cdn.example.com/fonts@1.0.0/brand-sans.woff2"
    cross-origin(anonymous)
    referrer-policy(no-referrer)
    integrity("sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC")
  ) format("woff2");
  font-display: swap;
}

.verified-graphic {
  background-image: url("https://cdn.example.com/media@1.0.0/badge.svg");
  background-image: url(
    "https://cdn.example.com/media@1.0.0/badge.svg"
    cross-origin(anonymous)
    referrer-policy(no-referrer)
  );
  background-image: url(
    "https://cdn.example.com/media@1.0.0/badge.svg"
    cross-origin(anonymous)
    referrer-policy(no-referrer)
    integrity("sha384-Iw/0p59dP96nGTzHvf2XIfqcBwBW7RM6JfOij8uZxyg5azfNaOOUW8SQy6H/hU91")
  );
}
```

4. **Feature-detect CSS `url()` modifier support in JavaScript with `CSS.supports()`**:

```javascript
export function getCssUrlModifierSupport() {
  const supportsCrossOriginAndReferrer =
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports(
      'background-image',
      'url("https://example.com/a.svg" cross-origin(anonymous) referrer-policy(no-referrer))',
    );

  const supportsUrlIntegrity =
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports(
      'background-image',
      'url("https://example.com/a.svg" cross-origin(anonymous) referrer-policy(no-referrer) integrity("sha384-Iw/0p59dP96nGTzHvf2XIfqcBwBW7RM6JfOij8uZxyg5azfNaOOUW8SQy6H/hU91"))',
    );

  return { supportsCrossOriginAndReferrer, supportsUrlIntegrity };
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/secure-external-subresources/guide.md#L133-L207). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
