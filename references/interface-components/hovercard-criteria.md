- Hovering over the link opens its associated popover.
- Focusing the link opens its associated popover.
- The popover uses `position-area` to position itself relative to the trigger link.
- The popover has a transition that includes `display` and `overlay` with `transition-behavior: allow-discrete`.
- The popover has a `@starting-style` block that defines its initial state for entry animations (e.g. `opacity: 0`).
- If `prefers-reduced-motion: reduce` is active, the popover opens without a transform or opacity transition.
- The trigger link references its popover via `aria-describedby` and does not have `aria-expanded`.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/hovercard/expectations.md#L1-L7). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
