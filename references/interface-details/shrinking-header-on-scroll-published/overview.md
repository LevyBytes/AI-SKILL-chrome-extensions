Related section: [Browser support and fallback strategies](browser-support-fallback-strategies.md).
# Shrinking header on scroll

A shrinking header on scroll is a common UI pattern where a fixed header element at the top of the page smoothly transitions to a smaller size as the user scrolls down. This effect is often used to maximize screen real estate for the main content while keeping essential navigation or branding elements accessible. With CSS scroll-driven animations, this effect can be achieved in a declarative and performant way, by linking an animation to the scroll position of the document.

## How to implement

Here’s how to create a shrinking header on scroll:

1.  **Create a fixed header:** Start with a header element that is fixed to the top of the page and has a predefined height.

    ```html
    <header>HEADER</header>
    ```

    ```css
    header {
      position: fixed;
      height: 200px;
      top: 0;
      left: 0;
      right: 0;
    }
    ```

2.  **Define the shrink animation:** Create a CSS animation that changes the height of the header.

    ```css
    @keyframes shrink {
      to {
        height: 50px;
      }
    }
    ```

3.  **Apply the animation and scroll timeline:** Attach the animation to the header and use the `scroll()` function to link it to the document’s scroll position.

    ```css
    header {
      animation: shrink auto linear both;
      animation-timeline: scroll(block root);
    }
    ```

4.  **Set the `animation-range`:** Use the `animation-range` property to specify the scroll distance over which the animation should occur. For example, to shrink the header over the first 150 pixels of scrolling, you would use `animation-range: 0px 150px;`.

    ```css
    header {
      animation-range: 0px 150px;
    }
    ```

If using `position: sticky` on the header element, set `scroll-padding-top` to ensure that when elements receive focus, they aren't displayed under the sticky content. Set the `scroll-padding-top` value to be the height of the sticky element, which will ensure that when controls receive focus, they'll be consistently visible, positioned following the sticky content. This ensures adherence to WCAG 2.4.11 Focus Not Obscured, ensuring that focused controls aren't completely obscured. The value of `scroll-padding-top` can be animated on the same `scroll-timeline` used to shrink the header, keeping the value inline with the visual updates.

**Tip:** To prevent the content following the header from being obscured by it, add a `padding-top` to the `body` (or the main content container) that is equal to the initial height of the header.

**Tip:** To make sure the contents of the page scroll in sync with the shrinking header, set the `animation-range-end` to the difference between the start and end sizes. This ensures the animation completes precisely when the header reaches its final size. In this demo the header shrinks from `200px` to `50px`, so the `animation-range-end` is set to `150px`.

## Example code

```css
@keyframes shrink {
  to {
    height: 50px;
  }
}

header {
  animation: shrink auto linear both;
  animation-timeline: scroll(block root);
  animation-range: 0px 150px;
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

When using the `scroll()` function to create a scroll-driven animation:

- **OPTIONAL** be explicit about the scroller: When not targeting the nearest ancestor scroller, be explicit about which scroller you want to use with `scroll(root)` or `scroll(self)`.
  - When `root`, `nearest`, or `self` are not sufficient, use a named scroll-timeline.
- **OPTIONAL** be explicit about the axis to track: When not targeting the default `block` axis (such as in a horizontal scroller), be explicit about which axis to track with `scroll(block)` or `scroll(inline)`.

As for this use case specifically:

- The element that you animate **MUST** not be `position: static` or `position: relative` when using percentages in the `animation-range`.
  - This is because those elements are considered “in-flow”. Shrinking those elements as you scroll, would shrink the total scroll distance, thereby affecting the computed value of — for example — `10%` into the scroll.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-atoms/shrinking-header-on-scroll.md#L1-L96). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
