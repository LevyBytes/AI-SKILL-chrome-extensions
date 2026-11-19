Related section: [Make every action reachable without a mouse](make-every-action-reachable-without-mouse.md).
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

Popovers and dropdowns should visibly open from the control that triggered them: scale out from the corner touching the trigger, or slide out from its side. Menus and hovercards have their own open motion; follow `menu` (via `npx -y modern-web-guidance@latest retrieve "menu"`) and `hovercard` (via `npx -y modern-web-guidance@latest retrieve "hovercard"`). For other popovers, place the popover next to its trigger and align `transform-origin` with the corner that touches it. To flip dropdowns at viewport edges, see `viewport-aware-dropdowns` (via `npx -y modern-web-guidance@latest retrieve "viewport-aware-dropdowns"`).

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

- Keep animations on the compositor (`transform`, its individual properties, and `opacity`) and respect reduced-motion preferences; see `motion` (via `npx -y modern-web-guidance@latest retrieve "motion"`). This example animates the opening only; for exit transitions, see `animate-to-from-top-layer` (via `npx -y modern-web-guidance@latest retrieve "animate-to-from-top-layer"`).
- Trigger popovers declaratively using `<button popovertarget="dropdown-id">` (see `declarative-dialog-popover-control` (via `npx -y modern-web-guidance@latest retrieve "declarative-dialog-popover-control"`)) to get native click, keyboard, and dismiss behavior without JavaScript.
- For a springy open, use a `linear()` curve that overshoots slightly before settling (an output value above 1); see `physics-based-easing` (via `npx -y modern-web-guidance@latest retrieve "physics-based-easing"`).

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
- To highlight the item that snaps into place, see `carousel-snap-highlights` (via `npx -y modern-web-guidance@latest retrieve "carousel-snap-highlights"`). To swipe a list item aside to reveal actions, see `swipe-to-reveal` (via `npx -y modern-web-guidance@latest retrieve "swipe-to-reveal"`). For side menus that close when swiped away, see `navigation-drawer` (via `npx -y modern-web-guidance@latest retrieve "navigation-drawer"`).
- For carousel controls such as previous and next buttons and scroll markers, see `carousel` (via `npx -y modern-web-guidance@latest retrieve "carousel"`).

### Add motion blur to large, fast movements (optional)

For large, rapid translations (such as a full-screen sheet sliding into view), a subtle, temporary blur softens the movement. `filter` doesn't run only on the compositor, so keep blur to large, brief movements, skip it for small controls or slow transitions, and always guard it with a reduced-motion media query.

```css
@media (prefers-reduced-motion: no-preference) {
  .sheet.is-open { animation: sheet-in 300ms ease-out both; } /* example duration */
}
@keyframes sheet-in {
  from { translate: 0 100%; filter: blur(6px); } /* example blur radius */
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/user-experience/natural-interactions.md#L1-L91). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
