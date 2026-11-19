- The application processes a heavy computation or large loop asynchronously.
- The application yields control back to the main thread periodically during the processing.
- The application uses a time-based deadline (e.g., 50ms) to determine when to yield.
- The application uses `scheduler.yield()` if available to yield back to the main thread.
- The application uses `setTimeout` as a fallback mechanism for browsers that do not support the Scheduler API.
- The application remains responsive to user interaction (e.g., hover states or clicks) while the task is processing.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/break-up-long-tasks/expectations.md#L1-L6). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
