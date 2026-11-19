- The application implements a mechanism to schedule tasks with different priorities using `scheduler.postTask()`.
- The application demonstrates the use of different priorities (e.g., `user-blocking`, `user-visible`, `background`).
- The application uses a polyfill to support task prioritization in browsers that do not support the Scheduler API natively.
- The application conditionally loads the polyfill only when needed.
- The application ensures that tasks are executed in priority order (higher priority tasks before lower priority ones).

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/schedule-tasks-by-priority/expectations.md#L1-L5). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
