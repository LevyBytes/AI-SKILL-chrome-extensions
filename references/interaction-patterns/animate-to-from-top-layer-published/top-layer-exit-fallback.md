### Top-layer exit fallback

Entry animations work in pure CSS across all browsers that support `@starting-style`—no `.is-opening` class is needed because entry transitions do not depend on `overlay` or discrete `display` transitions.

Exit animations require both `overlay` and discrete `display` transition support. When either is unsupported (such as in Firefox and Safari), wrap the open-state selectors in `:is()` and append `:where(:not([data-closing]))` (nesting `&::backdrop` and `@starting-style`) so setting `data-closing` triggers the exit transition while the element remains in the top layer, then wait for `getAnimations()` to settle before calling `.close()` or `.hidePopover()`:

```css
:is(dialog[open], [popover]:popover-open):where(:not([data-closing])) {
  opacity: 1;

  @starting-style {
    opacity: 0;
  }

  @media (prefers-reduced-motion: no-preference) {
    transform: scale(1);

    @starting-style {
      transform: scale(0.9);
    }
  }

  &::backdrop {
    background-color: rgb(0 0 0 / 0.5);

    @starting-style {
      background-color: transparent;
    }
  }
}
```

```javascript
// Evaluate lazily: canTransitionDisplay() needs document.body, so a top-level
// const would be permanently false if this script runs in <head>.
function supportsTopLayerExit() {
  return window.CSS?.supports?.('overlay', 'auto') && canTransitionDisplay();
}

async function closeTopLayer(element) {
  if (!supportsTopLayerExit()) {
    element.setAttribute('data-closing', '');
    const animations = element.getAnimations({ subtree: true });
    if (animations.length > 0) {
      await Promise.race([
        Promise.allSettled(animations.map((a) => a.finished)),
        new Promise((r) => setTimeout(r, 2000)),
      ]);
    }
    if (!element.hasAttribute('data-closing')) return;
    element.removeAttribute('data-closing');
  }

  element.close();
  // Or for popover:
  // element.hidePopover();
}

// Route native close requests (Esc, closedby light dismiss) through the same
// helper so they animate too, instead of closing instantly.
dialog.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeTopLayer(dialog);
});
```

Popover light dismiss and `popovertarget` toggles cannot be intercepted (`beforetoggle` is only cancelable when opening), so in browsers that need the fallback those exits are instant. Provide an explicit close control that calls `closeTopLayer()` if the exit animation matters.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/animate-to-from-top-layer.md#L146-L213). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
