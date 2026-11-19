- Buttons use the "commandfor" and "command" attributes to trigger actions.
- All custom command names start with "--".
- Invoker buttons have initial accessibility attributes (e.g., `aria-pressed="false"` or `aria-expanded="false"`) where appropriate.
- Clicking the "Spin" button toggles the "is-spun" class on the target element.
- Clicking the "Grow" button toggles the "is-grown" class on the target element.
- Clicking the "Make Round" button toggles the "is-rounded" class on the target element.
- Clicking the "Reset All" button removes the "is-spun", "is-grown", and "is-rounded" classes from the target element.
- When an action is triggered, the `aria-pressed` (or `aria-expanded`) attribute of the source button is manually updated to reflect the new state.
- The demo checks for native support of the Invoker Commands API before deciding to load a fallback strategy.
- The `command` event listener is attached directly to the target element.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/custom-button-actions/expectations.md#L1-L10). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
