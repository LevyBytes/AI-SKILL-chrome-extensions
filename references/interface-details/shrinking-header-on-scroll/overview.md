Related section: [Best Practices](best-practices.md).
```yaml
---
name: shrinking-header-on-scroll
description: Smoothly animate a fixed header or full-page cover on scroll to dynamically shrink, gain shadows, and transform its layout over a predefined scroll distance.
web-feature-ids:
  - scroll-driven-animations
---
```

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


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-atoms/shrinking-header-on-scroll/guide.md#L1-L80). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
