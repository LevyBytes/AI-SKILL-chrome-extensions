Related section: [Improve next page load performance](overview.md).
### Example of a mixed rule set

This example shows a rule set that prefetches all links eagerly, and then goes further than this to prerender those same links when it gets more signals with `moderate` eagerness.

```html
<script type="speculationrules">
  {
    "prefetch": [{
      "tag": "prefetch-speculations",
      "where": { "href_matches": "/*" },
      "eagerness": "eager"
    }],
    "prerender": [{
      "tag": "prerender-speculations",
      "where": { "href_matches": "/*" },
      "eagerness": "moderate"
    }]
  }
</script>
```

## Best Practices

- **DO** use speculation rules to prefetch and prerender pages that the user is likely to visit next.
- **DO** use speculation rules for static sites, where the content is not likely to change often, and where pages are cheaper to produce—especially if cached at the edge.
- **DO** take more care when using speculation rules for dynamic pages, where the content is more likely to change often, may become out of date, and where pages are more expensive to produce.
- **DO** prefer document rules over list rules, as they are more flexible, allow the same rule to be shared across multiple pages, and can be used to prefetch and prerender pages that are not known in advance.
- **DO** consider the trade-offs between prefetch and prerender, and choose the appropriate one for your use case. Prerender is more expensive than prefetch and can cause more unintended side effects in complex applications that display dynamic state, but provides a better user experience. Ask the developer for their preference if unsure.
- **DO** consider the trade-offs between the different `eagerness` levels, and choose the appropriate one for your use case. More eager speculation provides a better user experience but uses more resources and can cause more unintended side effects in complex applications that display dynamic state. Ask the developer for their preference if unsure.
- **DO NOT** overuse speculation rules, for example, to speculate every link on the page. Browsers have limits (2 speculations for non-eager speculations). `immediate` should only be used for a very small number of links.
- **DO NOT** speculate URLs that likely trigger state changes, like `/logout` or `/add-to-cart`, and explicitly exclude them from your speculation rules if they are likely to be included in document rules.
- **DO NOT** use speculation rules on Single Page Applications (SPAs). Speculation rules are designed for multi-page applications (MPAs) where the browser navigates to a new document on each navigation. In SPAs, the browser does not navigate to a new document on each navigation, so speculation rules will not work as expected.

## Browser support and fallback strategies

{{ BASELINE_STATUS("speculation-rules") }}

However, speculative loading is a progressive enhancement. It is perfectly safe to use as an enhancement, and is highly recommended given the potential performance benefits. If a browser does not support speculation rules, it will simply ignore them.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/improve-next-page-load-performance/guide.md#L89-L126). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
