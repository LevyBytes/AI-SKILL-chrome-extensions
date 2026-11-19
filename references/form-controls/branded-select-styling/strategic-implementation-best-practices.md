Related section: [Branded select styling](overview.md).
## Strategic Implementation & Best Practices

- **DO** use `appearance: base-select` when your design system requires high-fidelity, visual consistency across all form controls that cannot be achieved with standard cross-browser select overrides.
- **DO NOT** use this if you rely on the operating system's native picker experience (e.g., the standard scroll wheel picker on iOS devices). Opting into `base-select` opts out of native mobile UI controls in favor of web-rendered top-layer menus.
- **DO** verify that color contrast meets WCAG standards (at least `3:1` with the background color). The customizable picker allows you to set ad-hoc colors, but you are responsible for ensuring text remains legible against custom backgrounds.
{{ FEATURE("customizable-select", "usage") }}

## Fallback strategies

{{ FEATURE_FALLBACKS("customizable-select") }}

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/forms/branded-select-styling/guide.md#L92-L101). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
