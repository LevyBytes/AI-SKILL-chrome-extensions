* The agent has created a scrollable element with `overflow: auto` or `overflow: scroll` or `overflow-y` set.
* The scrollable element has the CSS properties `scrollbar-width` and/or `scrollbar-color` applied.
* The agent has provided a fallback for older browsers using the legacy `::-webkit-scrollbar` pseudo-elements.
* The sizes and background colors in the fallback pseudo-elements match the intended standard properties.
* The fallback includes basic `::-webkit-scrollbar` dimensions (e.g., `width` or `height`) so the scrollbar renders its colors in webkit browsers.
* The modern `scrollbar-width` and `scrollbar-color` properties are applied directly to the scrollable element.
* The fallback `::-webkit-scrollbar` styling is conditionally applied within an `@supports not (scrollbar-color: auto)` or equivalent feature query to prevent overriding modern properties.
* The thumb color of each `scrollbar-color` value has a contrast ratio of at least 3:1 against its track color.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/visual-design/customize-scrollbar-color-and-thickness/expectations.md#L1-L8). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
