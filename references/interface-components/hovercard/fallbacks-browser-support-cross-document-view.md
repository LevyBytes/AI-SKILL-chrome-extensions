### Fallbacks & browser support for Cross-document view transitions

{{ BASELINE_STATUS("cross-document-view-transitions") }}

Cross-document view transitions are a progressive enhancement. In browsers that do not support `@view-transition { navigation: auto; }`, the rule (along with `blocking="render"` and `<link rel="expect">` on the destination page) degrades gracefully and clicking the link performs a standard page navigation without the morph animation.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/hovercard/guide.md#L202-L206). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
