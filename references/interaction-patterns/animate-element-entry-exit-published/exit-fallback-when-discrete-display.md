### Exit fallback when discrete `display` transitions are unsupported

Entry animations using `@starting-style` work across all modern browsers without JavaScript. When discrete `display` transitions are unsupported (`!canTransitionDisplay()`), setting `hidden` applies `display: none` immediately and skips the exit animation (both when hiding and before `element.remove()`). Separate the visual exit state (`[data-closing]`) from `display: none` (`[hidden]`) so `opacity` and `translate` finish animating before hiding or removing the element. Replace the `.card[hidden]` rules from step 1 (including the `prefers-reduced-motion` override) with:

```css
.card:where([hidden], [data-closing]) {
  opacity: 0;
  translate: 0 -20px;
}

.card[hidden] {
  display: none;
}

@media (prefers-reduced-motion: reduce) {
  .card:where([hidden], [data-closing]) {
    translate: none;
  }
}
```

```javascript
async function hideElement(el) {
  if (canTransitionDisplay()) {
    el.hidden = true;
  } else {
    el.setAttribute('data-closing', '');
  }

  const animations = el.getAnimations();
  if (animations.length > 0) {
    await Promise.race([
      Promise.allSettled(animations.map((a) => a.finished)),
      new Promise((r) => setTimeout(r, 2000)),
    ]);
  }

  // Skipped if showElement() cancelled the close mid-animation.
  if (el.hasAttribute('data-closing')) {
    el.removeAttribute('data-closing');
    el.hidden = true;
  }
}

function showElement(el) {
  el.removeAttribute('data-closing');
  el.hidden = false;
}

async function removeElement(el) {
  await hideElement(el);
  el.remove();
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/animate-element-entry-exit.md#L140-L193). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
