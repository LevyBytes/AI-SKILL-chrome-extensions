Related section: [Precise text alignment](overview.md).
### Fallback strategies

{{ BASELINE_STATUS("text-box") }}

`text-box` is a progressive enhancement. In browsers that do not support it, the text will simply render with its default leading. Your layout will still be functional, though slightly less precise. No special fallback code is required as the properties are safely ignored by older browsers.

## Other Considerations

1. **Font Metrics**: Different fonts have different internal metrics. `cap alphabetic` is a reliable default, but some fonts or use cases may require `ex` (x-height) for better lowercase alignment.
2. **Multi-line Text**: Trimming applies to the first and last line of the block. Internal lines are not affected.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/visual-design/precise-text-alignment/guide.md#L95-L104). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
