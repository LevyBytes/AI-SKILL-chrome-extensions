```yaml
---
name: carousel
description: Build a carousel component that displays a set of items in a horizontal or vertical layout.
web-feature-ids:
  - scroll-snap
  - scroll-behavior
  - overscroll-behavior
  - scrollend
  - scroll-snap-events
  - scroll-driven-animations
  - sibling-count
guides:
  - carousel-slide-effects
  - carousel-snap-highlights
  - scroll-progress-indicator
  - scroll-snap-state-sync
---
```

# Build a carousel

Build a carousel for a finite set of related items. Use native scrolling and CSS scroll snap as the foundation; add HTML previous/next and marker controls, with a small script for wiring them and for status updates. This keeps content and basic scrolling usable without JavaScript.

## Structure and accessibility

- Use a named `region` with `aria-roledescription="carousel"` when the carousel is a meaningful page section. Give each slide `role="group"`, `aria-roledescription="slide"`, and an `aria-label` that includes its position (for example, `aria-label="2 of 4"`). Write the labels in the markup, localized with the rest of the page; if slides change at runtime, regenerate them from the same localized strings. The position is the slide's place in the original sequence, not its current visual position. Keep slide content available to assistive technology.
- Give every control a clear accessible name: use a native `<button>` with a text or `aria-label` name, not an unlabeled chevron.
- Announce the current slide in a visually hidden polite status region after scrolling settles. Update it whenever the visible slide changes, whether through the buttons, the markers, or direct scrolling, so assistive technology receives feedback.
- Ensure that where possible all interactive elements have a target size of at least 24 by 24 CSS pixels, as these provide a way to quickly navigate to each individual slide. This can be achieved by providing undersized elements with enough spacing so that a 24px circle centered on it does not overlap neighboring targets. To do this, make the target itself a little larger than the visible shape with padding, a pseudo-element, or a thin transparent border (with `background-clip: padding-box` so the fill stays on the visible shape), and leave the rest of the spacing to a gap. Do not rely on wide gaps alone, and do not make the invisible area so large that clicks well away from a control activate it. This adheres to the requirements in WCAG 2.5.8 Target Size.
- Ensure that all controls have sufficient contrast, with non-text elements requiring a contrast ratio of at least 3:1 between the non-text content and adjacent colors, in order to adhere to WCAG 1.4.11 Non-text Contrast.
- Ensure that when a previous/next control becomes disabled, causing focus to be lost, that focus is redirected elsewhere, such as the opposite control (e.g. move focus to "Next" if previous becomes disabled and has focus, or move focus to "Previous" if next becomes disabled and has focus).
- The active slide's control must not communicate that it is active through color alone, in order to adhere to WCAG 1.4.1 Use of Color. There must be another visual affordance, such as an outline, or use of a larger height/width, to convey that the control is active.

## Scrolling and controls

- Make the track natively scrollable and snap slides on its scrolling axis. For horizontal carousels, arrange slides in a row and use the inline axis; for vertical carousels, use a column and the block axis.
- Set `overscroll-behavior` to `contain` on the track's scrolling axis (`overscroll-behavior-x` for horizontal, `overscroll-behavior-y` for vertical). A scroll that reaches an end of the track then stays on the carousel instead of scrolling the page or starting a back or forward swipe, which makes repeated swipes at the ends smoother. Do not use the `overscroll-behavior` shorthand: it also contains the other axis, which can stop the page from scrolling while the pointer is over the carousel.
- Use HTML `<button>` elements for previous/next controls and one marker button per slide for direct navigation, in every browser. Do not use `::scroll-button()` or `::scroll-marker` for now.

{# MAINTAINER: native ::scroll-button() and ::scroll-marker are deliberately not used for now. Chrome drops keyboard focus from native scroll buttons when looping reorders the slides (https://issues.chromium.org/issues/581318163) and from native scroll markers when they are activated (https://issues.chromium.org/issues/582416742 , https://issues.chromium.org/issues/578562502), and markers are Chrome-only. Once these are fixed, re-verify keyboard focus, then re-add native controls in Chrome (infinite looping included) with this HTML implementation kept as the fallback elsewhere. Last implementation with native controls and the first-Tab swap to HTML controls: commit 11c35ea5. Consider a BCD key request. #}

- Keep controls visible, operable, and clearly focused with `:focus-visible`. Loop previous/next controls continuously from the last slide to the first and back by default when there are at least three slides (see Looping); disable them at the ends only when finite navigation is requested. Preserve native keyboard behavior; do not intercept keys from links, form fields, or buttons. Add custom key handling only for a defined interaction need, and avoid overriding nested controls.

## Related patterns

- For styling the active slide itself, see {{ GUIDE_REF("carousel-snap-highlights") }}.
- For a continuous progress indicator instead of discrete markers, see {{ GUIDE_REF("scroll-progress-indicator") }}.
- For scroll-driven slide effects, see {{ GUIDE_REF("carousel-slide-effects") }}.
- For synchronizing other UI with snap events, see {{ GUIDE_REF("scroll-snap-state-sync") }}.

## Example: horizontal carousel

This example uses full-width horizontal slides. Adapt the slide sizing for a peek layout or use the block axis for a vertical carousel. Give each marker a name that identifies its destination. The CSS below is split by concern, and only the parts that are easy to get wrong are shown; everything else is described in prose. Adapt dimensions, spacing, and colors to the design.

```html
<section class="carousel" aria-roledescription="carousel" aria-label="Featured products">
  <div class="carousel-controls">
    <button type="button" data-direction="previous">Previous slide</button>
    <button type="button" data-direction="next">Next slide</button>
  </div>

  <div class="carousel-track" tabindex="0" role="group" aria-label="Slides">
    <div role="group" aria-roledescription="slide" aria-label="1 of 3"
        data-marker-name="Go to slide 1">
      <h3>Product one</h3>
    </div>
    <div role="group" aria-roledescription="slide" aria-label="2 of 3"
        data-marker-name="Go to slide 2">
      <h3>Product two</h3>
    </div>
    <div role="group" aria-roledescription="slide" aria-label="3 of 3"
        data-marker-name="Go to slide 3">
      <h3>Product three</h3>
    </div>
  </div>

  <p class="visually-hidden" role="status" aria-live="polite"></p>

  <nav class="carousel-markers" aria-label="Choose a slide"></nav>
</section>
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/carousel/guide.md#L1-L81). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
