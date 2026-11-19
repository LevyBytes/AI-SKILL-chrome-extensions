### `@property` fallback (no registered custom properties):

{{ BASELINE_STATUS("registered-custom-properties") }}

`@property` is only needed because the scroll-driven animation interpolates `--drawer-backdrop` between keyframes — without registration, the property would be treated as a string and would jump between 0 and 1 with no fade. If the scroll-driven animation fallback above is in place, that JavaScript writes a fresh numeric string to `--drawer-backdrop` on every scroll frame and never interpolates, so no separate `@property` fallback is needed since all browsers that support scroll-driven animations also support `@property`.


### Popover API fallback (sidebar variant only):

{{ BASELINE_STATUS("popover", "api.HTMLElement.showPopover") }}

{{ BASELINE_STATUS("inert") }}

When the drawer [also acts as a sidebar](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/navigation-drawer/guide.md#implementation-for-a-drawer-that-also-acts-as-a-sidebar), it uses `popover="manual"` and implements dismissal entirely from JavaScript, so it does not depend on light-dismiss, the `popovertarget` attribute, or top-layer-managed Escape handling. Aside from top-layer promotion (`showPopover()`) and `::backdrop`, the only popover behavior it relies on is processing `autofocus` when shown.

If wider browser support is needed, do not branch on feature detection — simply do not use popover at all. Drop the `popover="manual"` attribute, replace top-layer promotion with `position: fixed` and a high `z-index`, replace `::backdrop` with a sibling element styled identically (using the same `--drawer-backdrop` custom property), toggle visibility from a class instead of `showPopover()`/`hidePopover()`, and call `closeBtn.focus({preventScroll: true})` in `openDrawer()` after making the drawer visible (`preventScroll` avoids scrolling the container early). The rest of the component (scroll snap, the scroll-driven backdrop animation, the `IntersectionObserver`, and the dismissal handlers) is unchanged.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/navigation-drawer/guide.md#L420-L435). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
