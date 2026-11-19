## 3. Animating entry and exit

{{ FEATURE("interest-invokers", "timing") }}

Use `@starting-style` to define the entry animation and `transition-behavior: allow-discrete` (along with `display` and `overlay`) to animate the exit from the top layer, gating the transitions behind `@media (prefers-reduced-motion: no-preference)`. Declare `transition-behavior: allow-discrete` as a separate property after `transition` rather than inside the `transition` shorthand so older browsers do not ignore the entire `transition` declaration.

```css
[popover].hovercard {
  opacity: 0;
  transform-origin: top;
}

[popover].hovercard:popover-open {
  opacity: 1;
  transform: translateY(0) scale(1);
}

@starting-style {
  [popover].hovercard:popover-open {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
}

/* MANDATORY: Respect user preference for reduced motion by selectively applying transitions. */
@media (prefers-reduced-motion: no-preference) {
  [popover].hovercard {
    transition:
      opacity,
      transform,
      display,
      overlay;
    transition-duration: 0.4s;
    /* Separate after transition so the shorthand doesn't reset it or fail in older browsers */
    transition-behavior: allow-discrete;
  }
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/hovercard/guide.md#L67-L105). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
