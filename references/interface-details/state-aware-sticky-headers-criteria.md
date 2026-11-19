- The header container uses `position: sticky` to remain at the top of the scroller.
- If any of the stuck styles change layout, `overflow-anchor: none` is applied to the parent of the header container.
- If none of the stuck styles change layout, `overflow-anchor: none` should NOT be applied to the parent of the header container.
- The header container defines `container-type: scroll-state` to enable scroll state queries.
- The header container defines a `container-name` to avoid collisions.
- The header visual style changes (e.g., background color or box-shadow) when it is stuck at the top.
- The visual style changes are implemented using the `@container scroll-state(...)` query (e.g., `stuck: top` or `stuck: block-start`).
- Stuck styles come from the container query, not JavaScript.
- `scroll-padding-top` is used to ensure that elements that receive focus aren't obscured by the sticky header.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-atoms/state-aware-sticky-headers/expectations.md#L1-L9). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
