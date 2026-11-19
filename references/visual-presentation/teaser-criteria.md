- The element with class `.paywall-container` (or its content element) has the `mask-image` property applied with a `linear-gradient`.
- The gradient transitions from opaque (e.g., black) to transparent to create a fade effect.
- If a faded blur is applied, it is done on a pseudo-element over the end of the teaser, not on the teaser itself
- If a faded blur is applied, the fade starts before the blur begins
- The call to action that follows the preview is not inside the masked element.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/visual-design/teaser/expectations.md#L1-L5). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
