## Example code

This code animates the carousel items of a horizontal scroller on scroll using an **anonymous view-timeline**:

```css
/* Scale values are examples; customize with performant properties such as transform, scale, or opacity */
@keyframes animate {
  0% {
    scale: 0.5;
  }

  50% {
    scale: 1;
  }

  100% {
    scale: 0.5;
  }
}

/* Only runs the effect when the user has no reduced-motion preference */
@media (prefers-reduced-motion: no-preference) {
  /* Include (animation-range: entry) to exclude browsers with partial scroll-driven animation support */
  @supports ((animation-timeline: view()) and (animation-range: entry)) {
    .scroller > * {
      /* Applies the animation using an `auto` duration */
      animation: animate auto linear both;
      /* Sets the animation timeline to use an anonymous view progress timeline, tracking the element's progress through the scroller on the inline axis */
      animation-timeline: view(inline);
    }
  }
}
```

This code animates the carousel items of a horizontal scroller on scroll using a **named view-timeline**:

```css
/* Scale values are examples; customize with performant properties such as transform, scale, or opacity */
@keyframes animate {
  0% {
    scale: 0.5;
  }

  50% {
    scale: 1;
  }

  100% {
    scale: 0.5;
  }
}

/* Only runs the effect when the user has no reduced-motion preference */
@media (prefers-reduced-motion: no-preference) {
  /* Include (animation-range: entry) to exclude browsers with partial scroll-driven animation support */
  @supports ((animation-timeline: view()) and (animation-range: entry)) {
    /* This creates a named view-timeline on each carousel item. The timeline is used to drive the animation that is applied on the same element. */
    .scroller > * {
      /* Applies the animation using an `auto` duration */
      animation: animate auto linear both;
      /* Defines a named view progress timeline, tracking the element's progress through the scroller on the inline axis */
      view-timeline: --item inline;
      /* Sets the animation timeline to use the named view progress timeline defined above */
      animation-timeline: --item;
    }
  }
}
```

## Best Practices

When using scroll-driven animations, it's important to follow a few best practices to ensure a smooth and accessible experience:

- **DO** include feature detection: Not all browsers support scroll-driven animations. Use `@supports ((animation-timeline: view()) and (animation-range: entry))` to check for support and provide a fallback for browsers that don't support it.
  - The `(animation-range: entry)` check **MUST** be included here, to filter out browsers with only partial support.
  - **DO NOT** use the `scroll-timeline-polyfill` package for the fallback strategy as it is not feature complete and has a lot of known issues.
  - If the animation is only considered to be decorative, opt for Progressive Enhancement and **DO NOT** provide a fallback.
- **DO** respect user preferences: Some users prefer to have less motion on the web. Use the `prefers-reduced-motion` media query to disable or reduce your animations for these users.
- **DO** try to animate only performant CSS properties: For the smoothest animations, stick to animating properties that can be handled by the browser's compositor thread, such as `transform` and `opacity`. Animating other properties like `width` or `height` can lead to performance issues.
- **DO** use the correct declaration order: When using the `animation` shorthand property, declare `animation-timeline` and `animation-range` *after* it to prevent the shorthand from resetting the timeline.

Use an anonymous `view()` timeline by default when the animated element is the same element being tracked, so you do not have to name every individual timeline. Use a named `view-timeline` instead when multiple elements reuse a single timeline (avoiding duplicate timelines) or when reaching across the DOM (such as animating descendants or non-ancestors via `timeline-scope` when `view()` or `scroll(nearest)` does not suffice).

When using the `view()` function to create a scroll-driven animation:

- **OPTIONAL** be explicit about the axis to track: When not targeting the default `block` axis (such as in a horizontal scroller), be explicit about which axis to track with `view(block)` or `view(inline)`.

When using the `view-timeline` property to create a scroll-driven animation:

- **DO** use a CSS `<dashed-ident>` for the name (e.g. `view-timeline: --my-custom-name`)
- **OPTIONAL** be explicit about the axis to track: When not targeting the default `block` axis (such as in a horizontal scroller), be explicit about which axis to track with `view-timeline-axis`.
- **DO** make sure the scope of the lookup works: When the element that is declaring the `view-timeline` is not a flat tree ancestor of the animated element, hoist up the visibility of the `view-timeline`’s name by using `timeline-scope` on a shared ancestor.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-atoms/carousel-slide-effects/guide.md#L64-L156). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
