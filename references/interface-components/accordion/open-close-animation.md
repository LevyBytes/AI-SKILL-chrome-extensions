### Open and close animation

{{ BASELINE_STATUS("details-content") }}

{{ BASELINE_STATUS("interpolate-size") }}

{{ BASELINE_STATUS("transition-behavior") }}

The animation is a progressive enhancement and needs no fallback. Without `interpolate-size`, items open and close instantly. Without `transition-behavior`, the content hides at the start of the collapse and the height animates empty, while opening still animates.

### Custom accordion

{{ BASELINE_STATUS("hidden-until-found") }}

Where `until-found` is unsupported, the attribute behaves as plain `hidden`: the content is hidden but not findable, and the accordion still works.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/accordion/guide.md#L342-L356). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
