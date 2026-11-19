Related section: [Checkbox](overview.md).
## The indeterminate state

The indeterminate state cannot be set via an HTML attribute; set the `indeterminate` DOM property in JavaScript (`checkbox.indeterminate = true`) and ensure the `:indeterminate` pseudo-class is visually distinct from both `:checked` and unchecked states:

* **Native (`accent-color`):** Automatically styled by the browser using the element's `accent-color` (no extra `:indeterminate` CSS rule needed).
* **Custom (`appearance: none`):** Swap `--checkbox-icon` to `var(--icon-dash)` on `.checkbox-custom:indeterminate` as shown above.

```js
const selectAll = document.querySelector("#select-all");
selectAll.indeterminate = true;
```

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

### Issues to be aware of when using accent-color

Browser rendering of `accent-color` varies.
For indicators generally painted over an accent color background, such as checkbox marks and radio-button dots, browsers may apply different treatments:
- **Chromium** and **Firefox** generally select a contrasting indicator color.
- **Safari** may instead preserve a white indicator in light mode or a black indicator in dark mode, while modifying the accent color behind it. This adjustment does not always provide sufficient contrast for every supplied color, so test important combinations in Safari, including both light and dark color schemes. Do not assume that Safari will automatically choose whichever indicator color provides the best contrast.

## Fallback strategies

### Fallbacks & browser support for accent-color

Browser support for accent-color: Limited availability.
Supported by: Chrome 93 (Aug 2021), Edge 93 (Sep 2021), Firefox 92 (Sep 2021), and Safari 26.2 (Dec 2025).

The `accent-color` property is progressive enhancement.
Browsers that do not support this property will ignore it and use their default UI colors.

### CSS Masks

Baseline status for Masks: Widely available. It's been Baseline since 2023-12-07.
Supported by: Chrome 120 (Dec 2023), Edge 120 (Dec 2023), Firefox 53 (Apr 2017), and Safari 15.4 (Mar 2022).

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/checkbox.md#L94-L144). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
