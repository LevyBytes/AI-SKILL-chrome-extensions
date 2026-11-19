### Fallbacks & browser support for scroll-driven animations

Baseline status for Scroll-driven animations: Newly available. It's been Baseline since 2026-10-27.
Supported by: Chrome 115 (Jul 2023), Edge 115 (Jul 2023), Firefox 159 (Oct 2026), and Safari 26 (Sep 2025).

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

Baseline status for Container style queries: Newly available. It's been Baseline since 2026-05-19.
Supported by: Chrome 111 (Mar 2023), Edge 111 (Mar 2023), Firefox 151 (May 2026), and Safari 18 (Sep 2024).

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

Browser support for interpolate-size: Limited availability.
Supported by: Chrome 129 (Sep 2024) and Edge 129 (Sep 2024).
Unsupported in: Firefox and Safari.

Without it, `max-content` cannot be interpolated and the element expands instantly. Transition to a length instead: one a little wider than the longest text. The growth stops as soon as the text fits, so a value far above it cuts the visible transition short.

```css
.chip {
  @supports not (interpolate-size: allow-keywords) {
    --expanded-max-inline-size: 20rem;
  }
}
```

### Fallbacks & browser support for container queries

Baseline status for Container queries (size): Widely available. It's been Baseline since 2023-02-14.
Supported by: Chrome 105 (Sep 2022), Edge 105 (Sep 2022), Firefox 110 (Feb 2023), and Safari 16 (Sep 2022).

Container queries and their units are widely available. No fallback is needed.

### Fallbacks & browser support for masks

Baseline status for Masks: Widely available. It's been Baseline since 2023-12-07.
Supported by: Chrome 120 (Dec 2023), Edge 120 (Dec 2023), Firefox 53 (Apr 2017), and Safari 15.4 (Mar 2022).

Masks, including `mask-composite` and `mask-clip: no-clip`, are widely available. No fallback is needed.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-atoms/single-line-overflow.md#L314-L393). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
