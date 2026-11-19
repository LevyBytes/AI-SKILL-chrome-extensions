Related section: [Example of a mixed rule set](mixed-rule-set.md).
```yaml
---
name: improve-next-page-load-performance
description: Improve page load performance by prefetching or prerendering pages that the user is likely to visit next.
web-feature-ids:
  - speculation-rules
---
```

# Improve next page load performance

One of the most effective ways to improve page load performance for users navigating a site is to initiate loading the next page they're about to visit *before* they visit it. This can be done through a technique called speculative loading using the Speculation Rules API.

## How it works

Speculative loading works by using JSON-based speculation rules to tell the browser about links that can be prefetched or prerendered improving page load performance when user clicks on them.

The rules can either be a hardcoded list of URLs a `urls` key (known as a list rule), or with a `where` key containing a set of href and CSS selectors used to find links on the page (known as a `document` rule).

Rules can also include an optional `eagerness` property that specifies when the page should be prefetched or prerendered. The `eagerness` property can be set to `immediate`, `eager`, `moderate`, or `conservative`. `immediate` speculates as soon as possible, while the others wait for user signals such as hovering for a short period, for a longer period, or starting to click on the page respectively.

Rules can be combined with different eagerness settings to prefetch eagerly and then prerender when the user interacts more.

## When to use it

Speculative loading is especially useful for static pages, where the content is not likely to change often, and where pages are cheaper to produce—especially if cached at the edge. It can also be used for dynamic pages, but it is important to be careful about the potential for stale content.

Speculative loading is typically used for same-origin links, though more advanced options allow for some cross-origin speculation. This guide concentrates on the more-common same-origin use case.

More eager speculative loading is a good choice for pages that are likely to be visited next, such as a headline article or the next page in a stepped process like a learning a course.

Less eager speculative loading is a good choice when it is less obvious what the user will do next, when there are many links on the page, each equally likely to be visited. By waiting for more signals, such as hovering, or starting to click on the page, you can get a head-start on the next page and improve the user experience, even if it is not fully prefetched or prerendered.

Similarly, prefetch is a more conservative choice than prerender, using less resources (on both the client and the server side) but providing less benefit to the user. It is a good choice for initial implementation, expanding to prerender later when the developer explicitly requests it.

## How to use it

Speculation rules have a JSON-based format and can be included in a `<script type="speculationrules">` tag. The rules can be included in the `<head>` or `<body>` of the document, or can be dynamically added using JavaScript.

A `tag` can also be used, either at a global level or on a per-rule basis. When set, this tag will be included in the `Sec-Speculation-Tags` header, and allows you to identify server-side which speculations were made.

### Example of a simple URL list rule for prefetching predefined URLs

```html
<script type="speculationrules">
  {
    "tag": "product-page-speculations",
    "prefetch": [
      {
        "urls": ["/product/1", "/product/2", "/product/3"]
      }
    ]
  }
</script>
```

### Example of a simple document rule for prerendering all same-origin links on a page

```html
<script type="speculationrules">
  {
    "tag": "all-links-speculations",
    "prerender": [{
      "where": { "href_matches": "/*" }
    }]
  }
</script>
```

### Example of a complex document rule for prerendering links with exclusions for interactive sites

```html
<script type="speculationrules">
  {
    "tag": "speculations-with-exclusions",
    "prerender": [{
      "where": {
        "and": [
          { "href_matches": "/*" },
          { "not": {"href_matches": "/wp-admin"}},
          { "not": {"href_matches": "/*\\?*(^|&)add-to-cart=*"}},
          { "not": {"selector_matches": ".do-not-prerender"}},
          { "not": {"selector_matches": "[rel~=nofollow]"}}
        ]
      }
    }]
  }
</script>
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/improve-next-page-load-performance/guide.md#L1-L88). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
