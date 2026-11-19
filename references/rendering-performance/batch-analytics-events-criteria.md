- The `fetchLater()` API is invoked with a URL string as the first argument, and a valid `DeferredRequestInit` object (without a `ReadableStream` request body) as the second argument.
- The `fetchLater()` API (with `fetch()` or `sendBeacon()` only in its polyfill fallback) is the primary API that should be used to send beacons. Other APIs like `XMLHttpRequest` or `new Image()` should not be used.
- `fetchLater()` should be invoked with the `activateAfter` option set.
- Multiple invocations of `fetchLater()` within the `activateAfter` time window should be batched into a single request (e.g. prior calls should be aborted).
- Batching should be limited in some way to prevent starvation or quota overflow.
- If a `fetchLater()` call throws a `QuotaExceededError`, `RangeError`, or `TypeError`, it should be properly handled.
- The `fetchLater()` polyfill should be included in the bundle, unless the project is only supporting Chromium browsers.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/batch-analytics-events/expectations.md#L1-L7). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
