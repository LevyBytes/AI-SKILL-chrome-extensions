- The primary Largest Contentful Paint (LCP) hero `<img>` element has the `fetchpriority="high"` attribute.
- The primary Largest Contentful Paint (LCP) hero `<img>` element does NOT have the `loading="lazy"` attribute.
- No more than two `<img>` elements on the page have the `fetchpriority="high"` attribute.
- Initially hidden or off-screen above-the-fold `<img>` elements (such as collapsed menu/dropdown promos, modal visuals, or inactive carousel slides) have the `fetchpriority="low"` attribute.
- Standard below-the-fold `<img>` elements (such as product/menu card grids or footer images) use the `loading="lazy"` attribute.
- Standard below-the-fold `<img>` elements do NOT have the `fetchpriority` attribute (neither `fetchpriority="low"` nor `fetchpriority="auto"`).
- No `<img>` elements have the deprecated `importance` attribute or invalid `loading="auto"` attribute.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/optimize-image-priority/expectations.md#L1-L7). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
