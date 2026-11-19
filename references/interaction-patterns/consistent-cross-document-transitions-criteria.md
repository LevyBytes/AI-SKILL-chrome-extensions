- Both the source and destination pages include the `@view-transition { navigation: auto; }` CSS at-rule.
- `<link rel="expect" href="#element-id" blocking="render">` is used in the `<head>` to block rendering until above-the-fold DOM elements have been parsed, ensuring the transition snapshot captures a visually complete page.
- Critical stylesheets are placed in the `<head>`, and any pre-transition scripts or expect links in the `<head>` are marked with `blocking="render"` while third-party scripts are not render-blocked.
- Render blocking is limited to resources and elements visible in the initial viewport. Non-critical or below-the-fold content is NOT render-blocked.
- No two elements on the same page share the same `view-transition-name` value.
- Cross-document view transitions MUST be disabled when `prefers-reduced-motion: reduce` is active.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/consistent-cross-document-transitions/expectations.md#L1-L6). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
