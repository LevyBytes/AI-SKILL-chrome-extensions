Related section: [Add motion blur to large, fast movements (optional)](add-motion-blur-large-fast-movements-optional.md).
```yaml
---
name: natural-interactions
description: Implement natural interactions with clear hover, focus, and press feedback, motion that opens from its trigger, swipeable content, and keyboard-reachable actions.
web-feature-ids:
  - focus-visible
  - linear-easing
  - scroll-snap
  - popover
  - anchor-positioning
---
```

# Implement natural interactions

Interfaces feel natural when every input gets an immediate response, motion behaves like a physical object, content follows the user's finger, and nothing depends on a mouse.

## Implementation

### Give every control hover, press, and focus feedback

```css
:where(button) {
  /* example durations */
  transition: box-shadow 150ms ease-out, scale 150ms ease-out;
}
button:hover { box-shadow: 0 2px 8px rgb(0 0 0 / 0.2); }
a:hover { text-decoration-thickness: 2px; }
button:active { scale: 0.97; } /* example value */

:where(a, button, input, select, textarea, summary, [tabindex]):focus-visible {
  outline: 2px solid CanvasText;
  outline-offset: 3px;
}
```

- Use `:focus-visible` so keyboard users always see a clear focus ring, without showing it on mouse clicks.
- DO NOT remove focus outlines (`outline: none` or `outline: 0`) without providing an equally visible replacement with at least a 3:1 contrast ratio against the page (WCAG 1.4.11). `CanvasText` is the text color for the page's `color-scheme`, so it contrasts with the default page background in light mode, in dark mode (with `color-scheme: light dark`), and in forced colors. If you set your own page background, pick a ring color with 3:1 against it. `currentColor` fails when a button's text color matches the page.
- Make each interaction state look different, including combinations: hover, press, pressing while hovering, and keyboard focus. In the example, hover adds a shadow, press a scale, and focus an outline, so any combination shows each of its parts.

### Open disclosures from their trigger

Popovers and dropdowns should visibly open from the control that triggered them: scale out from the corner touching the trigger, or slide out from its side. Menus and hovercards have their own open motion; follow {{ GUIDE_REF("menu") }} and {{ GUIDE_REF("hovercard") }}. For other popovers, place the popover next to its trigger and align `transform-origin` with the corner that touches it. To flip dropdowns at viewport edges, see {{ GUIDE_REF("viewport-aware-dropdowns") }}.

```css
.dropdown {
  /* popovertarget makes the trigger the popover's anchor. */
  position-area: bottom span-right;
  inset: auto;
  margin: 0;
  /* The corner touching the trigger; change it whenever the placement changes. */
  transform-origin: top left;
}
/* example durations */
.dropdown:is(:popover-open, .\:popover-open) { animation: fade-in 150ms ease-out both; }
@media (prefers-reduced-motion: no-preference) {
  .dropdown:is(:popover-open, .\:popover-open) {
    /* optional example spring curve, written inline */
    animation: grow 300ms linear(0, 0.45 15%, 1.08 35%, 0.97 55%, 1.01 75%, 1) both, fade-in 150ms ease-out both;
  }
}
@keyframes grow { from { scale: 0.9; } }
@keyframes fade-in { from { opacity: 0; } }
```

- Keep animations on the compositor (`transform`, its individual properties, and `opacity`) and respect reduced-motion preferences; see {{ GUIDE_REF("motion") }}. This example animates the opening only; for exit transitions, see {{ GUIDE_REF("animate-to-from-top-layer") }}.
- Trigger popovers declaratively using `<button popovertarget="dropdown-id">` (see {{ GUIDE_REF("declarative-dialog-popover-control") }}) to get native click, keyboard, and dismiss behavior without JavaScript.
- For a springy open, use a `linear()` curve that overshoots slightly before settling (an output value above 1); see {{ GUIDE_REF("physics-based-easing") }}.

### Make horizontal scrollers swipeable

Any horizontally scrollable row of items, such as a carousel, gallery, or row of chips, should scroll natively and snap to its items.

```css
.scroller {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}
.scroller > * {
  flex: 0 0 85%; /* example item width */
  scroll-snap-align: start;
}
```

- Native overflow scrolling gives swiping its physics and momentum, and snapping makes each swipe come to rest on an item, with no touch listeners.
- If none of the scroller's items contains a link, button, or other focusable element, make the scroller itself focusable and labeled (`<div class="scroller" role="region" aria-label="Featured items" tabindex="0">`), so keyboard users can reach it and scroll it with the arrow keys. When items are focusable, tabbing to them already scrolls them into view.
- To highlight the item that snaps into place, see {{ GUIDE_REF("carousel-snap-highlights") }}. To swipe a list item aside to reveal actions, see {{ GUIDE_REF("swipe-to-reveal") }}. For side menus that close when swiped away, see {{ GUIDE_REF("navigation-drawer") }}.
- For carousel controls such as previous and next buttons and scroll markers, see {{ GUIDE_REF("carousel") }}.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/user-experience/natural-interactions/guide.md#L1-L89). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
