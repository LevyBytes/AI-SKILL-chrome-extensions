## Example code

```css
@supports ((animation-timeline: scroll()) and (animation-range: 0% 100%)) {
  html {
    timeline-scope: --tl-1, --tl-2, --tl-3, --tl-4, --tl-5;
  }

  #tracked {
    section:nth-child(1){ view-timeline: --tl-1 block; }
    section:nth-child(2){ view-timeline: --tl-2 block; }
    section:nth-child(3){ view-timeline: --tl-3 block; }
    section:nth-child(4){ view-timeline: --tl-4 block; }
    section:nth-child(5){ view-timeline: --tl-5 block; }
  }

  @keyframes animate-in {
    from { scale: 0.5; opacity: 0; transform: rotateY(-180deg); }
    to { transform: rotateY(0deg); }
  }
  @keyframes animate-out {
    to { translate: 100% 0; opacity: 0; }
  }

  #animated {
    section {
      animation: animate-in auto linear both, animate-out auto linear forwards;
      animation-range: entry 25% cover 50%, exit 50% exit 75%;
      backface-visibility: hidden;
    }

    section:nth-child(1){ animation-timeline: --tl-1; }
    section:nth-child(2){ animation-timeline: --tl-2; }
    section:nth-child(3){ animation-timeline: --tl-3; }
    section:nth-child(4){ animation-timeline: --tl-4; }
    section:nth-child(5){ animation-timeline: --tl-5; }
  }
}

/* MANDATORY Copy-Paste Safety: Disable continuous storytelling motion for sensitive users */
@media (prefers-reduced-motion: reduce) {
  #animated section {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
```

## Best Practices

When using scroll-driven animations, it's important to follow a few best practices to ensure a smooth and accessible experience:

- **DO** include feature detection: Not all browsers support scroll-driven animations. Use `@supports ((animation-timeline: scroll()) and (animation-range: 0% 100%))` to check for support and provide a fallback for browsers that don't support it.
  - The `(animation-range: 0% 100%)` check **MUST** be included here, to filter out browsers with only partial support.
  - **DO NOT** use the `scroll-timeline-polyfill` package for the fallback strategy as it is not feature complete and has a lot of known issues.
  - If the animation is only considered to be decorative, opt for Progressive Enhancement and **DO NOT** provide a fallback.
- **DO** respect user preferences: Some users prefer to have less motion on the web. Use the `prefers-reduced-motion` media query to disable or reduce your animations for these users.
- **DO** try to animate only performant CSS properties: For the smoothest animations, stick to animating properties that can be handled by the browser's compositor thread, such as `transform` and `opacity`. Animating other properties like `width` or `height` can lead to performance issues.
- **DO** use the correct declaration order: When using the `animation` shorthand property, declare `animation-timeline` and `animation-range` *after* it to prevent the shorthand from resetting the timeline.

When using the `view-timeline` property to create a scroll-driven animation:

- **DO** use a CSS `<dashed-ident>` for the name.
- **OPTIONAL** be explicit about the axis to track: When not targeting the default `block` axis (such as in a horizontal scroller), be explicit about which axis to track with `view-timeline-axis`.
- **DO** make sure the scope of the lookup works: When the element that is declaring the `view-timeline` is not a flat tree ancestor of the animated element, hoist up the visibility of the `view-timeline`’s name by using `timeline-scope` on a shared ancestor.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/scrollytelling/guide.md#L61-L127). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
