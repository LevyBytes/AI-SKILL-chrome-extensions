- The implementation MUST use the `scrollend` event to defer expensive tasks (e.g., dynamic content fetching, analytics tracking, dynamic DOM updates).
- The implementation MUST feature-detect the `scrollend` event by checking `'onscrollend' in window` before initialization.
- The implementation MUST fall back to using a debounced `scroll` event with `window.scrollendtimer` to dispatch a custom `scrollend` event if native support is missing.
- The implementation MUST NOT execute heavy layout recalculations or data analytics updates inside the visual `scroll` event listener.
- The implementation MUST NOT use legacy debounced `scroll` events with `setTimeout` as the primary strategy to guess and trigger scroll completion.
- The implementation MUST use a scrollable container with `overflow: auto` or `overflow: scroll`.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/defer-work-until-scroll-ends/expectations.md#L1-L6). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
