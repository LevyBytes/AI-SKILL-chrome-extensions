## 3. Secure CSS images, fonts, and imported stylesheets with `url()` modifiers

CSS `url()` request modifiers (`cross-origin()`, `referrer-policy()`, and `integrity()`) control the fetch mode, referrer header, and Subresource Integrity verification of CSS-loaded resources—including `background-image`, `content`, `mask-image`, `border-image-source`, `filter`, `@font-face` `src`, and `@import` rules—directly from CSS:

| Modifier function | Argument syntax & allowed values | Purpose |
|---|---|---|
| `cross-origin(<ident>)` | **Unquoted keyword**: `anonymous` (recommended default) or `use-credentials` | Fetches the CSS resource using CORS and controls whether credentials are sent. Always include alongside `integrity()` on cross-origin CSS resources. |
| `referrer-policy(<ident>)` | **Unquoted keyword**: `no-referrer` (recommended default for third-party assets), `strict-origin-when-cross-origin`, `origin`, `same-origin`, `strict-origin`, `origin-when-cross-origin`, `no-referrer-when-downgrade`, or `unsafe-url` | Overrides the document referrer policy for this specific CSS request. |
| `integrity("<string>")` | **Quoted string**: `"sha384-<base64>"` (or space-separated digests `"sha384-... sha384-..."`) | Verifies the fetched CSS resource against the expected cryptographic digest before rendering or applying it. |

Follow these CSS syntax and security rules when authoring `url()` modifiers:

- **Quote the URL string inside `url("...")`**: Request modifiers are only valid when the URL inside `url(...)` is a quoted `<string>` (unquoted URLs cannot use modifiers).
- **Specify each modifier type at most once per `url()`**: You can combine `cross-origin()`, `referrer-policy()`, and `integrity()` in any order inside `url("..." ...)`, but repeating the same modifier type twice (such as two `integrity()` modifiers) is invalid. To supply multiple hashes, space-separate them inside a single `integrity("sha384-... sha384-...")` string.
- **Always pair cross-origin `integrity()` with `cross-origin(anonymous)`**: While `@font-face` `src` and `mask-image` already fetch in anonymous `cors` mode by default, `background-image`, `content`, `border-image-source`, and `@import` default to `no-cors` mode (producing an opaque response that cannot be hash-verified) and external SVG `filter` defaults to `same-origin` mode (blocking cross-origin URLs outright). Including `cross-origin(anonymous)` (or `cross-origin(use-credentials)`) ensures consistent CORS verification across every CSS property.
- **Place modifiers inside `url("...")` in `@import` and `@font-face` rules**: Keep `cross-origin()`, `referrer-policy()`, and `integrity()` inside `url("..." ...)`, while keeping font descriptors like `format("woff2")` and `tech(...)` outside `url(...)`.

```css
@import url(
  "https://cdn.example.com/theme@1.2.0/tokens.css"
  cross-origin(anonymous)
  referrer-policy(no-referrer)
  integrity("sha384-bs0EksOYBbU/g0IAHMXbSyH1Mgw83GKn+EZlSI+VE+zVchXmSbLwhVLrPzsOWnc5")
);

@font-face {
  font-family: "BrandSans";
  src: url(
    "https://cdn.example.com/fonts@1.0.0/brand-sans.woff2"
    cross-origin(anonymous)
    referrer-policy(no-referrer)
    integrity("sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC")
  ) format("woff2");
  font-display: swap;
}

.verified-graphic {
  background-image: url(
    "https://cdn.example.com/media@1.0.0/badge.svg"
    cross-origin(anonymous)
    referrer-policy(no-referrer)
    integrity("sha384-Iw/0p59dP96nGTzHvf2XIfqcBwBW7RM6JfOij8uZxyg5azfNaOOUW8SQy6H/hU91")
  );
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/secure-external-subresources/guide.md#L87-L132). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
