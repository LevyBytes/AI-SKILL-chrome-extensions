```yaml
---
name: navigation-drawer
description: Create a navigation drawer component that, when triggered from a menu button, slides in from the side overlaid on top of existing page content, and slides out when dismissed (by swiping away, tapping outside, or pressing escape).
web-feature-ids:
  - dialog
  - inert
  - intersection-observer
  - popover
  - registered-custom-properties
  - scroll-driven-animations
  - scroll-initial-target
  - scroll-snap
---
```

# Navigation Drawer

## Overview

A navigation drawer is a panel that slides in from the edge of the viewport over the page content, dimming everything behind it. It is opened from a trigger button and dismissed by swiping the panel off-screen, tapping the dimmed backdrop, activating an explicit Close button inside the panel, or pressing Escape.

This guide implements the drawer as:

- A top-layer element (a modal `<dialog>` or a `popover="manual"` element, see [Choose the drawer element](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/navigation-drawer/guide.md#choose-the-drawer-element)), so the panel and its `::backdrop` overlay every other element on the page, regardless of stacking context.
- A horizontally scrolling container with two CSS scroll-snap stops — one for "open", one for "closed" — so the swipe gesture is handled natively by the browser. This delivers momentum, velocity, and interruption tracking for free, with no JavaScript pointer-event code.
- A scroll-driven animation that ties the backdrop's opacity to the scroll position, so the dim fades in and out smoothly as the user drags the panel.
- An `IntersectionObserver` on the panel that detects when it has fully entered or fully left the viewport, and uses those moments to close the drawer and update its state.

This approach is preferred over JavaScript-driven `transform` animations because the scroll mechanism gives the user direct control of the panel's position (their finger drives it, not a tween) and it much more closely matches the interaction patterns that users are accustomed to in native mobile apps.

### Choose the drawer element

First, decide whether the drawer is only ever a drawer, or whether the same element also becomes a regular, always-visible sidebar under certain conditions (e.g. on wide screens). If the request does not say, assume it is only ever a drawer.

- **Only ever a drawer**: use a `<dialog>` element opened with `showModal()`. The browser makes the rest of the page inert, exposes the drawer as a modal dialog to assistive technologies, handles Escape, and restores focus on close. See [Implementation with `<dialog>`](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/navigation-drawer/guide.md#implementation-with-dialog).
- **Also a sidebar**: use a regular element with `role="dialog"` and `popover="manual"`, and remove the `role` while it acts as a sidebar. A `<dialog>` element does not work here, since it is always exposed as a dialog, but a sidebar is not one. Because a popover is not modal, the code must handle modality manually. See [Implementation for a drawer that also acts as a sidebar](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/navigation-drawer/guide.md#implementation-for-a-drawer-that-also-acts-as-a-sidebar).

## Implementation with `<dialog>`

### 1. Markup

The drawer is a single `<dialog>` containing a horizontal scroller, which contains the visible "sheet". The trigger button lives in the page content. The drawer's close button has an `autofocus` attribute so that this control receives focus when the drawer is opened.

```html
<!-- MANDATORY: Provide an accessible name for the dialog with aria-label or,
     if there is already text within the drawer that can act as its accessible name,
     with aria-labelledby. -->
<dialog class="Drawer" id="drawer" aria-label="Navigation drawer">
  <div class="Drawer-scroller">
    <nav class="Drawer-sheet">
      <!-- Close button that can be used to dismiss the drawer -->
      <button id="drawer-close" aria-label="Close menu" autofocus>
        <!-- close icon or blank if icon inserted via CSS -->
      </button>
      <ul>
        <li><a href="/page-1">Page 1</a></li>
        <li><a href="/page-2">Page 2</a></li>
        <!-- ... -->
      </ul>
    </nav>
  </div>
</dialog>

<main>
  <header>
    <!-- aria-controls links the trigger to the drawer; aria-expanded
         reflects the current state for assistive tech. -->
    <button id="drawer-open"
            aria-label="Menu"
            aria-expanded="false"
            aria-controls="drawer">
      <!-- open icon or blank if icon inserted via CSS -->
    </button>
  </header>
  <!-- Page content. -->
</main>
```

See {{ GUIDE_REF('icons') }} for maintaining accessibility when using icons.

### 2. Styles


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/navigation-drawer/guide.md#L1-L81). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
