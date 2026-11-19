```yaml
---
name: swipe-to-reveal
description: Let users swipe horizontally on a list item or content pane to reveal contextual action buttons or a side menu without automatically triggering an action.
web-feature-ids:
  - overscroll-behavior
  - scroll-initial-target
  - scroll-snap
  - scrollbar-width
---
```

# Swipe to reveal

Swipe-to-reveal patterns let users slide a foreground row or content pane horizontally to expose hidden UI—such as contextual action buttons (*Pin*, *Mute*, *Archive*, *Delete*) or a secondary side menu—**without automatically activating any action**. Instead of committing an action during the swipe, the container snaps open to reveal interactive controls that the user can inspect and activate, or swipe back to close.

> For a full-width swipe gesture that immediately commits and dismisses an item past a threshold, see {{ GUIDE_REF("swipe-to-remove") }}. For revealing a hidden header at the top of a vertical scroll container, see {{ GUIDE_REF("pull-to-reveal") }}.

## How to implement

Whether you are revealing action buttons on a list item or a side menu next to a scrollable pane, the mechanics are identical: wrap the foreground content and the hidden panel inside an outer horizontal scroll container configured with **CSS Scroll Snap** (`scroll-snap-type: x mandatory`) and **`overscroll-behavior: chain`**. The browser's native scrolling engine handles momentum, snapping, keyboard focus scrolling, and scroll chaining without JavaScript gesture listeners.

### Step 1: Mark up the swipe wrapper, content, and revealed panel

Place the foreground content first and the revealed controls (action buttons or a side menu) second inside the `.SwipeReveal` scroll container. Because the content is first in DOM order, the scroll container naturally starts at scroll offset `0` with the panel hidden off-screen to the right. For each swipe action, ensure that the accessible name includes the content that it relates to, so that people can differentiate between the available controls.

```html
<!-- Example A: List item with revealable action buttons -->
<div class="SwipeReveal">
  <div class="SwipeReveal-content">
    <strong>Design review notes</strong>
    <p>Updated component specs for the Q3 release.</p>
    <button aria-label="Design review notes actions" aria-expanded="false">…</button>
  </div>
  <div class="SwipeReveal-panel" role="group" aria-label="Item actions">
    <button type="button" tabindex="-1">Pin</button>
    <button type="button" tabindex="-1">Archive</button>
    <button type="button" tabindex="-1">Delete</button>
  </div>
</div>

<!-- Example B: Scrollable content pane with a revealable side menu -->
<div class="SwipeReveal" role="region" aria-label="Document preview with swipeable side menu">
  <div class="SwipeReveal-content is-scrollable" tabindex="0">
    <h2>Article Preview</h2>
    <p>Scroll vertically through this pane, or swipe left to reveal the side menu...</p>
    <button aria-label="Article actions" aria-expanded="false">…</button>
  </div>
  <nav class="SwipeReveal-panel" aria-label="Contextual menu">
    <a href="#share" tabindex="-1">Share</a>
    <a href="#bookmark" tabindex="-1">Bookmark</a>
    <a href="#export" tabindex="-1">Export PDF</a>
  </nav>
</div>
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/swipe-to-reveal/guide.md#L1-L54). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
