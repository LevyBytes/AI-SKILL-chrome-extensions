# Brand-Consistent Forms

Customizing standard HTML form elements like checkboxes and radio buttons has historically been difficult. Developers often faced a choice between using the browser defaults or building custom components from scratch. Building custom controls is time-consuming and can easily lead to accessibility issues or missing states (like the indeterminate state for checkboxes).

The CSS property `accent-color` provides a simple way to bring your brand color to built-in HTML form inputs with a single line of CSS, without sacrificing accessibility or built-in browser features.

## How to Implement

To apply your brand color to form controls:

1. **Identify your brand color:** Choose a color that represents your brand.
2. **Apply the `accent-color` property:** Add `accent-color` to the element or a container element (like `body` or a specific form) in your CSS.
3. **Support Dark Mode (Optional but Recommended):** Use `color-scheme` to let the browser know your site supports dark mode, and adjust the `accent-color` if necessary for better contrast.

## Example Code: Brand-Consistent Form Controls

```css
:root {
  --brand-color: #6200ee;
}

/* Apply accent-color to the body or a specific container */
body {
  accent-color: var(--brand-color);
}

/* Optional: Adjust for dark mode if needed */
@media (prefers-color-scheme: dark) {
  :root {
    --brand-color: #bb86fc; /* A lighter shade for dark mode */
  }
}
```

```html
<form>
  <!-- Checkbox -->
  <label for="subscribe">
    <input type="checkbox" id="subscribe" checked>
    Subscribe to newsletter
  </label>

  <!-- Radio Buttons -->
  <label for="plan-monthly">
    <input type="radio" id="plan-monthly" name="plan" value="monthly">
    Monthly
  </label>
  <label for="plan-yearly">
    <input type="radio" id="plan-yearly" name="plan" value="yearly" checked>
    Yearly
  </label>

  <!-- Range Slider -->
  <label for="volume">Volume:</label>
  <input type="range" id="volume" min="0" max="100" value="70">

  <!-- Progress Bar -->
  <label for="file">Upload Progress:</label>
  <progress id="file" max="100" value="70">70%</progress>
</form>
```

## Strategic Implementation & Best Practices

- **DO** use `accent-color` to easily theme form controls to match your brand.
- **DO NOT** blindly trust the browser to handle contrast. While browsers are supposed to automatically determine an eligible contrast color, known bugs in implementations like **Safari** (WebKit bug 244233) and **Android Chrome** (Chromium bug 343503163) can fail to invert checkmark colors, leading to invisible or hard-to-see controls when using colors that lack sufficient contrast against the background (e.g., light colors in light mode, or dark colors in dark mode).
- **DO** combine `accent-color` with `color-scheme: light dark` to ensure form controls look good in both light and dark themes.
- **DO NOT** use a color that is too close to the background color, even though browsers try to guarantee contrast, it's best to provide a color with good base contrast (at least `3:1` with the background color).
- **DO NOT** assume `accent-color` works on all form elements. Currently, it only tints `checkbox`, `radio`, `range`, and `progress` elements.

## Fallback Strategy

Browser support for accent-color: Limited availability.
Supported by: Chrome 93 (Aug 2021), Edge 93 (Sep 2021), Firefox 92 (Sep 2021), and Safari 26.2 (Dec 2025).

For browsers that do not support `accent-color`, the form controls fall back to the browser's default appearance. To ensure full brand consistency and high reliability across all environments, you MUST implement a custom fallback strategy using the established "visually hidden input" technique.

### Progressive Enhancement with `@supports not`

You MUST use the `@supports not` rule to apply custom fallback styles only when `accent-color` is not supported. This ensures you leverage the simplicity of `accent-color` for modern browsers while guaranteeing a consistent branded experience for older ones.

#### 1. HTML Structure
Ensure your labels wrap the text in a `<span>` to allow for sibling selectors in CSS:
```html
<label for="subscribe-fallback">
  <input type="checkbox" id="subscribe-fallback" class="visually-hidden" checked>
  <span>Subscribe to newsletter</span>
</label>
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/forms/brand-consistent-forms.md#L1-L90). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
