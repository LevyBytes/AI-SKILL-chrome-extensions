Related section: [Dynamic sibling styling](overview.md).
### Fallback strategies

{{ BASELINE_STATUS("sibling-count") }}

If `sibling-index()` and `sibling-count()` are not supported, provide a fallback by injecting CSS custom properties via JavaScript. **MANDATORY:** Use feature detection with `CSS.supports()` to ensure the script only runs when necessary.

```js
/* MANDATORY: Check for native support before applying fallback */
if (!CSS.supports('top: calc(sibling-index() * 1px)')) {
  const items = document.querySelectorAll('.item');
  items.forEach((item, index) => {
    /* MANDATORY: Injected index must be 1-based to match native function */
    item.style.setProperty('--sibling-index', index + 1);
    item.style.setProperty('--sibling-count', items.length);
  });
}
```

In your CSS, use these variables as a base and override them with native functions inside an `@supports` block. **MANDATORY:** You MUST wrap the native function overrides in `@supports` to ensure the variables remain valid in older browsers.

```css
.item {
  /* 1. Set base values using variables (from JS fallback) */
  --index: var(--sibling-index);
  --count: var(--sibling-count);

  /* 2. Use the computed variables - replace this with your implementation-specific styles */
  background-color: hsl(calc(360deg / var(--count) * var(--index)), 70%, 50%);
}

@supports (top: calc(sibling-index() * 1px)) {
  .item {
    /* 3. Override with native functions ONLY if supported */
    --index: sibling-index();
    --count: sibling-count();
  }
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/css/dynamic-sibling-styling/guide.md#L67-L104). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
