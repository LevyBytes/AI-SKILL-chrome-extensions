- The invoker element (e.g. button) must have an `interestfor` attribute pointing to the target element's ID.
- The target element must respond to the `interest` event to show the preview state (e.g. updating content or styles).
- The target element must respond to the `loseinterest` event to revert the preview state.
- The polyfill for interest invokers should be conditionally installed.
- The implementation MUST NOT announce interest-driven preview state changes via a live region (e.g. `role="status"` / `aria-live`). Interest is a passive signal and broadcasting every apply/unapply produces noise; reserve announcements for committed actions (e.g. on click).

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/interest-triggered-action-previews/expectations.md#L1-L5). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
