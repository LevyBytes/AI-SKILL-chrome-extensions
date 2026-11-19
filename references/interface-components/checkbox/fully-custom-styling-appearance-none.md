## Fully custom styling with `appearance: none`

Use `appearance: none` when the design requires control over the checkbox’s
shape, size, states, or indicators. This removes the native visual styling while
leaving the `<input>` as the interactive target.

Set explicit relative sizes for `--checkbox-size` and `--checkbox-icon-size` because `appearance: none` removes the browser’s default dimensions. Keep the icon smaller than the checkbox to provide space for its border and visual padding.

```css
/* Reusable SVG assets */
:root {
  --icon-check: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='20 6 9 17 4 12'></polyline></svg>");
  --icon-dash: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='4.5' stroke-linecap='round' stroke-linejoin='round'><line x1='5' y1='12' x2='19' y2='12'></line></svg>");
}

/* Custom checkbox */
.checkbox-custom {
  --checkbox-size: 1.25em;
  --checkbox-icon-size: 0.7em;

  appearance: none;
  display: inline-grid;
  place-content: center;
  inline-size: var(--checkbox-size);
  aspect-ratio: 1;
  margin: 0;
  border: 2px solid currentColor;
  cursor: pointer;

  &::before {
    content: "";
    inline-size: var(--checkbox-icon-size);
    aspect-ratio: 1;
    background-color: currentColor;
    mask: var(--checkbox-icon) no-repeat center / contain;
    scale: 0;

    @media (prefers-reduced-motion: no-preference) {
      transition: scale 150ms ease;
    }

    @media (forced-colors: active) {
      background-color: CanvasText;
    }
  }

  &:checked {
    --checkbox-icon: var(--icon-check);
  }

  &:indeterminate {
    --checkbox-icon: var(--icon-dash);
  }

  &:is(:checked, :indeterminate)::before {
    scale: 1;
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}
```


## The indeterminate state

The indeterminate state cannot be set via an HTML attribute; set the `indeterminate` DOM property in JavaScript (`checkbox.indeterminate = true`) and ensure the `:indeterminate` pseudo-class is visually distinct from both `:checked` and unchecked states:

* **Native (`accent-color`):** Automatically styled by the browser using the element's `accent-color` (no extra `:indeterminate` CSS rule needed).
* **Custom (`appearance: none`):** Swap `--checkbox-icon` to `var(--icon-dash)` on `.checkbox-custom:indeterminate` as shown above.

```js
const selectAll = document.querySelector("#select-all");
selectAll.indeterminate = true;
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/checkbox/guide.md#L33-L115). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
