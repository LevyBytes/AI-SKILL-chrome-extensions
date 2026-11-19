### Fallbacks & browser support for scroll-driven animations

{{ BASELINE_STATUS("scroll-driven-animations") }}

Without scroll-driven animations the fade never shows, the hint never shows, and the scroll reveal never starts: the text is clipped with no indication. If your Baseline target does not support them, toggle a class from script: a `ResizeObserver` compares `scrollWidth` to `clientWidth`, and the class sets the same flag as the keyframes. Run the check again when the text changes: `ResizeObserver` reacts only to size changes.

```js
if (!CSS.supports('animation-timeline', 'scroll()')) {
  const observer = new ResizeObserver(entries => {
    for (const { target } of entries) {
      target.classList.toggle('truncated', target.scrollWidth > target.clientWidth);
    }
  });

  for (const label of document.querySelectorAll('.label')) {
    observer.observe(label);
  }
}
```

```css
/* Same as the keyframes */
.label.truncated {
  --truncated: 1;
}
```

### Fallbacks & browser support for style queries

{{ BASELINE_STATUS("container-style-queries") }}

Without style queries the fade still works, since it is on the element itself, but the hint and the scroll reveal never apply. Gate them on the class from the scroll-driven animations fallback above instead, and set that class without the `CSS.supports` guard: at-rules cannot be feature-detected.

```css
/* Same as the style queries */
.label.truncated > span {
  text-decoration: underline dotted;
}

@media (prefers-reduced-motion: no-preference) {
  .label.truncated:is(:hover, :focus-visible) > span {
    display: inline-block;
    margin-inline-start: 100%;
    translate: calc(1px - 100%);
    transition: margin-inline-start 2s ease-in, translate 2s ease-in;
  }
}
```

### Fallbacks & browser support for `interpolate-size`

{{ BASELINE_STATUS("interpolate-size") }}

Without it, `max-content` cannot be interpolated and the element expands instantly. Transition to a length instead: one a little wider than the longest text. The growth stops as soon as the text fits, so a value far above it cuts the visible transition short.

```css
.chip {
  @supports not (interpolate-size: allow-keywords) {
    --expanded-max-inline-size: 20rem;
  }
}
```

### Fallbacks & browser support for container queries

{{ BASELINE_STATUS("container-queries") }}

Container queries and their units are widely available. No fallback is needed.

### Fallbacks & browser support for masks

{{ BASELINE_STATUS("masks") }}

Masks, including `mask-composite` and `mask-clip: no-clip`, are widely available. No fallback is needed.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-atoms/single-line-overflow/guide.md#L333-L406). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
