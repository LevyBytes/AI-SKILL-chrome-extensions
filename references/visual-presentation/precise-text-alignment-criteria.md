1. The `text-box-trim` property (or `text-box` shorthand) must be applied to the text element to remove internal leading.
2. The `text-box-trim` value should be appropriate for the use case (e.g., `trim-both` for centering and padding, or `trim-start` for top-alignment).
3. The `text-box-edge` property (or `text-box` shorthand) must specify the font metrics for trimming, such as `cap alphabetic`. Both edges must be specified, even if both edges are not being trimmed.
4. Visual alignment should be achieved, meaning the visible text content (e.g., the top of capital letters or the alphabetic baseline) should align precisely with adjacent elements or container edges as intended.
5. Long-form body text must not have `text-box-trim` applied.
6. Visual centering or flush alignment must not use magic number negative margins on candidate elements.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/visual-design/precise-text-alignment/expectations.md#L1-L6). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
