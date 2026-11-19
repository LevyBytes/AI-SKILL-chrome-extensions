- The `fetchLater()` API is invoked with a URL string as the first argument, and (optionally) a `DeferredRequestInit` object as the second argument.
- The `fetchLater()` API is the only API that should be used to send beacons. Other APIs like `fetch()`, `sendBeacon()`, `XMLHttpRequest`, or `new Image()` should not used.
- Only a single beacon should be sent, after the user leaves the page.
- If a `fetchLater()` call throws a `QuotaExceededError`, `RangeError`, or `TypeError`, it should be properly handled.
- The `fetchLater()` polyfill should be included in the bundle, unless the project is only supporting Chromium browsers.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/full-session-analytics/expectations.md#L1-L5). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
