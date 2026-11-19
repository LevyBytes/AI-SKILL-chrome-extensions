## Accessibility and interaction

- **DO** use `:focus-visible` rather than `:focus` to style focus indicators on custom checkboxes so a distinct outline appears for keyboard navigation without showing on pointer clicks.
- **DO NOT** use `outline: none` or hide focus indicators on checkboxes.
- **DO** ensure the contrast of focus indicators has a contrast of at least `3:1` with the background color
- **DO** ensure the color for the checked and indeterminate state has a contrast of at least `3:1` with the background color
- **DO** ensure the checkbox or its wrapping `<label>` provides an interactive hit target of at least `44px x 44px` while keeping the visual checkbox box sized in relative units:
  ```css
  label {
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    min-block-size: 44px;
    cursor: pointer;
  }
  ```
- **DO** provide a `:disabled` style variant that lowers opacity and sets `cursor: not-allowed` to convey inactive states clearly.

{{ FEATURE_ISSUES("accent-color") }}

## Fallback strategies

{{ FEATURE_FALLBACKS("accent-color") }}

### CSS Masks

{{ BASELINE_STATUS("masks") }}

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/checkbox/guide.md#L116-L142). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
