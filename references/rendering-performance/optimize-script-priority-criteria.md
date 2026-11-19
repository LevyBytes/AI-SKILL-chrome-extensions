- The script at `/js/app.js` has both the `async` and `fetchpriority="high"` attributes.
- The script at `/js/legacy-widgets.js` has the `fetchpriority="low"` attribute.
- No more than two `<script>` elements total on the page have the `fetchpriority="high"` attribute.
- The script at `/js/tracker.js` does NOT have the `fetchpriority="high"` attribute.
- No `<script>` elements have the deprecated `importance` attribute.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/optimize-script-priority/expectations.md#L1-L5). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
