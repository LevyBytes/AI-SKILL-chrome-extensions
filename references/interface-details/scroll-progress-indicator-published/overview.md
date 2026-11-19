Related section: [Best Practices](best-practices.md).
# Build a Scroll Progress Indicator

A scroll progress indicator is a common user interface pattern that visually communicates the user's progress through a scrollable document or container. As the user scrolls, a visual element updates to reflect their position, providing a clear and intuitive sense of how much content has been viewed and how much remains.

## How to implement

To create a scroll progress indicator, you need two things:

1.  An element to act as the progress bar. This element is typically `position: fixed` or `position: absolute` so that it stays in view while the user scrolls.
2.  An animation that is linked to the scroll position.

Here’s how you can achieve this:

-   First, create an HTML element that will serve as your progress bar. This element can be styled to your liking.
-   Next, in your CSS, define a `@keyframes` animation that scales the progress bar. A common approach is to scale the element from `scaleX(0)` to `scaleX(1)`.
-   Finally, apply this animation to your progress bar element and set its `animation-timeline` to a scroll-timeline. This tells the browser to drive the animation's progress based on the scroll position of the nearest ancestor scroller.

## Example code

This code grows the `#progress` element on scroll using an anonymous scroll-timeline, created by the `scroll()` function.

```css
@media (prefers-reduced-motion: no-preference) {
  @supports ((animation-timeline: scroll())) {
    @keyframes grow-progress {
      from { transform: scaleX(0); }
      to { transform: scaleX(1); }
    }

    #progress {
      position: fixed;
      left: 0; top: 0;
      width: 100%; height: 1em;
      background: red;

      transform-origin: 0 50%;
      animation: grow-progress auto linear;
      animation-timeline: scroll();
    }
  }
}
```

Because of its location in the DOM, the `scroll()` function will track its nearest ancestor scroller in the `block` direction, which here is the root scroller.

```html
<body>
  <div id="progress"></div>
</body>
```

This code grows the `#progress` element on scroll using a named scroll-timeline, created by the `scroll-timeline` property.

```css
@media (prefers-reduced-motion: no-preference) {
  @supports ((animation-timeline: scroll())) {
    @keyframes grow-progress {
      from { transform: scaleX(0); }
      to { transform: scaleX(1); }
    }

    :root {
      scroll-timeline: --tl block;
    }

    #progress {
      position: fixed;
      left: 0; top: 0;
      width: 100%; height: 1em;
      background: red;

      transform-origin: 0 50%;
      animation: grow-progress auto linear;
      animation-timeline: --tl;
    }
  }
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-atoms/scroll-progress-indicator.md#L1-L79). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
