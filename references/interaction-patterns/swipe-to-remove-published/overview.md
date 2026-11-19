# Swipe to remove

Swipe-to-remove patterns are common in mobile applications but can be challenging to implement cleanly on the web. By using CSS Scroll Snap, you can create a smooth, native-feeling swipe interaction that hooks directly into the browser's scrolling engine. This ensures high performance and physics-based momentum without needing a complex JavaScript gesture library.

The same pattern works for any single-action swipe (remove, archive, mark as read, snooze). The action visuals change; the mechanics do not.

> If you instead want a horizontal swipe to snap open a set of action buttons or a side menu **without** automatically committing an action during the swipe, see `swipe-to-reveal` (via `npx -y modern-web-guidance@latest retrieve "swipe-to-reveal"`).

## How to implement

The component has two layers: a **list** (the `<ul>`) and the **items** inside it. Each item is structured as an outer `<li>`, an inner scroll **track** (the scroll container with the snap points), and a **content** element (the visible row). The action's revealed UI (trash icon, archive label, etc.) lives on either side of the content. The list owns shared wiring (lazy item setup, picking up newly added items); each item owns its own swipe detection.

### Step 1: Mark up the list with track and content

```html
<!-- tabindex="-1" lets focus move here when the last item is removed (Step 4). -->
<h2 id="list-heading" tabindex="-1">Inbox</h2>

<!-- Safari removes list semantics when list-style is none; role="list"
     restores the item count for screen readers. -->
<ul class="SwipeableList" role="list" aria-labelledby="list-heading">
  <li id="list-item-1" class="SwipeableList-item">
    <div class="SwipeableList-track">
      <div class="SwipeableList-content">
        <span class="SwipeableList-label">Item One</span>
        <!-- Swiping can't be done with a keyboard, a single tap or a screen
             reader, so each swipe action needs another way to run it (see
             "Accessibility considerations"). This example gives each swipe
             action its own button. data-direction
             is the swipe direction the button stands in for (Step 4), and
             including the item name in the button text tells screen reader
             users which row it acts on. This example has a single action. -->
        <button type="button" class="SwipeableList-action" data-direction="right">
          Remove<span class="visually-hidden"> Item One</span>
        </button>
      </div>
    </div>
  </li>
  <!-- ...more items... -->
</ul>

<!-- Screen readers only announce changes to a live region that was already
     in the page, so render this empty and fill it on removal (Step 4). -->
<p role="status" class="SwipeableList-status visually-hidden"></p>
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/swipe-to-remove.md#L1-L46). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
