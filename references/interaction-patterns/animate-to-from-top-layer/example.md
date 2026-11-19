## Example

```css
/* 1. Define the visible (open) state */
dialog[open],
[popover]:popover-open {
  opacity: 1;

  /* 2. Define the starting state for entry (must come after open state) */
  @starting-style {
    opacity: 0;
  }

  /* Scale only for users who haven't asked for reduced motion (see 5) */
  @media (prefers-reduced-motion: no-preference) {
    transform: scale(1);

    @starting-style {
      transform: scale(0.9);
    }
  }
}

/* 3. Define the base (closed/exit) state and transitions */
dialog,
[popover] {
  opacity: 0;

  /* MANDATORY: transition display and overlay for top-layer elements */
  transition-property: opacity, transform, display, overlay;
  transition-duration: 0.3s;
  transition-timing-function: ease-out;
  /* Separate after transition so a shorthand doesn't reset it or fail in older browsers */
  transition-behavior: allow-discrete;

  @media (prefers-reduced-motion: no-preference) {
    transform: scale(0.9);
  }
}

/* 4. Animate the backdrop */
dialog::backdrop,
[popover]::backdrop {
  background-color: rgba(0, 0, 0, 0);
  transition-property: background-color, display, overlay;
  transition-duration: 0.3s;
  transition-timing-function: ease-out;
  /* Separate after transition so a shorthand doesn't reset it or fail in older browsers */
  transition-behavior: allow-discrete;
}

dialog[open]::backdrop,
[popover]:popover-open::backdrop {
  background-color: rgba(0, 0, 0, 0.5);

  @starting-style {
    background-color: rgba(0, 0, 0, 0);
  }
}

/* 5. Respect user preference for reduced motion: the scale above only applies
   with no-preference, so this only shortens the fade */
@media (prefers-reduced-motion: reduce) {
  dialog,
  [popover] {
    transition-duration: 0.1s;
  }
}
```

## Constraints & Accessibility

- **MANDATORY**: Include `overlay` in your `transition` list for any element moving into or out of the top layer.
- **MANDATORY**: Use `transition-behavior: allow-discrete` when transitioning `display` and `overlay`.
- **DO NOT**: Use `allow-discrete` in the `transition` shorthand — it will make older browsers ignore the entire `transition` declaration. Except in use cases where that is desirable, use a separate `transition-behavior: allow-discrete` declaration.
- **MANDATORY**: Respect user preferences for reduced motion by applying transforms only inside `@media (prefers-reduced-motion: no-preference)` and shortening the transition duration inside `@media (prefers-reduced-motion: reduce)`, so users who prefer reduced motion get a short fade.
- **DO**: Place the `@starting-style` block inside or after the "open" state selector to ensure proper cascading.
- **DO NOT**: Use `@starting-style` for exit animations; exit animations are defined by the transition to the base (closed) state.

## Fallback strategies

{{ BASELINE_STATUS("starting-style") }}
{{ BASELINE_STATUS("overlay") }}

{{ FEATURE_FALLBACKS("transition-behavior") }}


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/animate-to-from-top-layer/guide.md#L35-L120). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
