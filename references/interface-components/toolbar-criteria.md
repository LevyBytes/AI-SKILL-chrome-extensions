- The toolbar container has `role="toolbar"`.
- The toolbar container has a non-empty `aria-label`.
- Related toolbar controls are wrapped in `role="group"` elements that each have a non-empty `aria-label`.
- Adjacent `role="group"` elements in the toolbar are divided by an element with `role="separator"`.
- Every icon-only toolbar button has a non-empty `aria-label`.
- The toolbar container has a `focusgroup` attribute whose value includes `toolbar`.
- Pressing `Tab` from the first toolbar item moves focus out of the toolbar rather than to the next item.
- In a horizontal toolbar, pressing `ArrowRight` on an item moves focus to the next item.
- Pressing `Home` on a toolbar item moves focus to the first item.
- Clicking a toggle button that is not part of a mutually exclusive set flips its `aria-pressed` value between `true` and `false`.
- Action buttons that have no on/off state do not have an `aria-pressed` attribute.
- In a browser that supports interest invokers and anchor positioning, each icon-only toolbar button upgrades its `title` tooltip at runtime to an `interestfor` attribute referencing an element with `popover="hint"`, or retains its non-empty `title` where unsupported.
- In a horizontal toolbar, when `popover="hint"` tooltips are present, each hint is positioned along the block axis with `position-area` (`block-end` or `block-start`), not the inline axis.
- No tooltip element or its invoker button sets `role="tooltip"`, `aria-describedby`, or `aria-details` manually.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/toolbar/expectations.md#L1-L14). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
