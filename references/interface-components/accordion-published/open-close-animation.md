### Open and close animation

Baseline status for ::details-content: Newly available. It's been Baseline since 2025-09-16.
Supported by: Chrome 131 (Nov 2024), Edge 131 (Nov 2024), Firefox 143 (Sep 2025), and Safari 18.4 (Mar 2025).

Browser support for interpolate-size: Limited availability.
Supported by: Chrome 129 (Sep 2024) and Edge 129 (Sep 2024).
Unsupported in: Firefox and Safari.

Baseline status for transition-behavior: Newly available. It's been Baseline since 2024-08-06.
Supported by: Chrome 117 (Sep 2023), Edge 117 (Sep 2023), Firefox 129 (Aug 2024), and Safari 17.4 (Mar 2024).

The animation is a progressive enhancement and needs no fallback. Without `interpolate-size`, items open and close instantly. Without `transition-behavior`, the content hides at the start of the collapse and the height animates empty, while opening still animates.

### Custom accordion

Browser support for hidden="until-found": Limited availability.
Supported by: Chrome 102 (May 2022), Edge 102 (May 2022), and Firefox 148 (Feb 2026).
Unsupported in: Safari.

Where `until-found` is unsupported, the attribute behaves as plain `hidden`: the content is hidden but not findable, and the accordion still works.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/accordion.md#L323-L343). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
