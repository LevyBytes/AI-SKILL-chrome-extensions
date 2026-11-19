## 3. Animating entry and exit

By default, interest is shown and lost for keyboard and mouse users with a delay of half a second. This prevents the targeted popover from opening while tabbing through a page or moving your mouse around, and from closing while moving your mouse from the trigger to the popover. To adjust the timing, use the `interest-delay` CSS property.

```css
[interestfor]{
  /* Shorthand for interest-delay-start and interest-delay-end */
  interest-delay: 0.2s 0.1s;
}
```

If users are likely to move through multiple triggers in quick succession, set the initial delay to `0s` if an interest-triggered popover is already open. To prevent performance issues with `:has()`, select a nearby container with a small number of child nodes, and target the triggers as directly as possible.

```css
.container:has( > li > a:interest-source) [interestfor] {
  interest-delay-start: 0s;
}
```

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


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/hovercard.md#L76-L129). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
