### Fallbacks & browser support for scroll-state container queries

Browser support for Container scroll-state queries: Limited availability.
Supported by: Chrome 144 (Jan 2026) and Edge 144 (Jan 2026).
Unsupported in: Firefox and Safari.

Without scroll-state queries, the shadows stay hidden. Show them with a scroll-driven animation instead, which has broader support. The pseudo-elements are inside the scroller, so `scroll()` uses it as their timeline. Each shadow fades in over the first few pixels of scrolling away from its edge, instead of toggling.

```css
@supports not (container-type: scroll-state) {
  .scroller::before,
  .scroller::after {
    animation: show-shadow linear both;
    animation-timeline: scroll();
  }

  .scroller::before {
    /* Example value: how much scrolling it takes to fully show the shadow */
    animation-range: 0 2rem;
  }

  .scroller::after {
    animation-direction: reverse;
    animation-range: calc(100% - 2rem) 100%;
  }
}

@keyframes show-shadow {
  to {
    opacity: 1;
  }
}
```

When the content fits, the scroll timeline is inactive, so neither shadow shows. If your Baseline target does not support scroll-driven animations either, use one of the last-resort fallbacks below.

### Fallbacks & browser support for scroll-driven animations

Baseline status for Scroll-driven animations: Newly available. It's been Baseline since 2026-10-27.
Supported by: Chrome 115 (Jul 2023), Edge 115 (Jul 2023), Firefox 159 (Oct 2026), and Safari 26 (Sep 2025).

Without scroll-driven animations, the fades are never shown, and neither are the shadows if scroll-state queries are also unsupported. Use one of these last-resort fallbacks.

#### Shadows on a solid background: background attachment

If the scroller has a solid background color, draw the shadows with backgrounds instead. This works in every browser and needs no JavaScript.
Each shadow is a `scroll` background, which stays at the edge of the scrollport.
Each shadow has a cover: a `local` background in the scroller's own color, which scrolls with the content.
At either end of the content its cover sits on top of its shadow and hides it; once the user scrolls away from that end, the cover moves away and the shadow shows.

```css
@supports not ((container-type: scroll-state) or (animation-timeline: scroll())) {
  .scroller {
    background:
      /* Covers: scroll with the content. Must use the scroller's own background color. */
      linear-gradient(var(--surface) 30%, transparent) top / 100% 2.5rem no-repeat local,
      linear-gradient(transparent, var(--surface) 70%) bottom / 100% 2.5rem no-repeat local,
      /* Shadows: stay at the edges of the scrollport */
      radial-gradient(farthest-side at 50% 0, rgb(0 0 0 / .15), transparent) top / 100% .75rem no-repeat,
      radial-gradient(farthest-side at 50% 100%, rgb(0 0 0 / .15), transparent) bottom / 100% .75rem no-repeat,
      var(--surface);
  }
}
```

The shadows paint behind the content, so content with its own opaque background hides them. In that case, use the `IntersectionObserver` fallback below.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-atoms/scrollability-affordance-hints.md#L157-L223). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
