Related section: [Animate element entry exit](overview.md).
### 2. Animating DOM Insertion and Removal

For elements added via `appendChild()` or removed via `remove()`:

- **Entry**: Use `@starting-style` as shown above. The browser will automatically detect the style change from "nothing" to the element's initial styles and trigger the transition from the `@starting-style` values.
- **Removal**: Since `element.remove()` is instantaneous and doesn't trigger a CSS transition on its own, you must trigger the exit transition first and wait for it to finish before removing the node from the DOM.

```javascript
// 1. Trigger exit transition
element.hidden = true;

// 2. Wait for all active transitions/animations to finish,
//    with a failsafe timeout in case an animation never ends (e.g. for looping animations)
const animations = element.getAnimations();
if (animations.length > 0) {
  await Promise.race([
    // Promise.allSettled ensures we wait even if some animations fail
    Promise.allSettled(animations.map(a => a.finished)),
    new Promise(r => setTimeout(r, 2000))
  ]);
}

// 3. Finally remove the node from the DOM
element.remove();
```

## Constraints & Accessibility

- **MANDATORY**: Use `transition-behavior: allow-discrete` when transitioning `display`. Without it, the element will instantly disappear during exit.
- **DO NOT** use `allow-discrete` in the `transition` shorthand — it will make older browsers ignore the entire `transition` declaration. Except in use cases where that is desirable, use a separate `transition-behavior: allow-discrete` declaration.
- **MANDATORY**: Use `@starting-style` for entry animations. Browsers skip transitions on an element's first style update (initial render or `display: none` change) unless this is provided.
- **DO**: Include `overlay` in the `transition` list if animating top-layer elements like `<dialog>` or `popover` to ensure they stay in the top layer during the exit animation.
- **DO**: Respect user preferences for reduced motion using the `prefers-reduced-motion` media query.
- **DO NOT**: Rely on `@starting-style` for exit animations; it only defines the *starting* point for an entry transition. Exit animations are defined by the transition to the hidden state.

## Fallback strategies

{{ BASELINE_STATUS("starting-style") }}

{{ FEATURE_FALLBACKS("transition-behavior") }}

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

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/animate-element-entry-exit/guide.md#L73-L167). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
