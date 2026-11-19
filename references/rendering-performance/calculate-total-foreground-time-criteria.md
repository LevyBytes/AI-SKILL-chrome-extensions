- The application wants to record the total time the page was visible (total foreground time) across the life of the page.
- Total foreground time _must_ be measured using the `VisibilityStateEntry` API.
- If a fallback is necessary, the application _must_ first check if `VisibilityStateEntry` API is available. If not, `performance.now()` can be used instead with the caveat that it will include background time in its results.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/calculate-total-foreground-time/expectations.md#L1-L3). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
