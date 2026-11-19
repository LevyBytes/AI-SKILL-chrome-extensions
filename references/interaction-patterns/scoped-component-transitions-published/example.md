## Example

No CSS is needed on the scope element itself (`.card` or `.card ul`) to establish the scope—the scope is determined by calling `startViewTransition()` on the element instead of `document` (if the component will be nested inside an outer view transition, see [Running an outer transition](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/scoped-component-transitions.md#running-an-outer-transition) for `view-transition-scope: all`).

```css
/* 1. Name participating child items */
.card ul li {
  view-transition-name: match-element;
}

/* 2. OPTIONAL: Customize transition timing (300ms is an example duration) */
::view-transition-group(*) {
  animation-duration: 300ms;
  animation-timing-function: ease-in-out;
}

/* 3. MANDATORY: Respect user preference for reduced motion */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
}
```

```javascript
// 1. Trigger a transition scoped to a single component subtree
function runScopedTransition(scopeEl, updateDOM) {
  // MANDATORY: Call startViewTransition on the component element, not document
  const transition = scopeEl.startViewTransition(() => {
    updateDOM();
  });

  // Re-triggering startViewTransition() on the same element skips the active transition
  // and rejects `ready`. Catch the rejection to avoid unhandled promise rejection errors.
  transition.ready.catch(() => {});
}

// 2. Reorder items by moving existing DOM nodes (required for `match-element`)
// Scope to `listEl` since only the list order changes, keeping controls outside `listEl` interactive
function reorderItems(listEl, orderedIds) {
  const existing = new Map(
    Array.from(listEl.children, (li) => [li.dataset.id, li]),
  );

  runScopedTransition(listEl, () => {
    for (const id of orderedIds) {
      const li = existing.get(id);
      if (li) listEl.appendChild(li);
    }
  });
}

// 3. Remove an item while preserving exit animation and keyboard focus
// Scope to the outer `cardEl` so the card itself also transitions its height change
function removeItem(cardEl, itemEl) {
  const hadFocus = itemEl.contains(document.activeElement);
  const nextFocusTarget =
    itemEl.nextElementSibling?.querySelector('button') ??
    itemEl.previousElementSibling?.querySelector('button') ??
    cardEl.querySelector('button');

  runScopedTransition(cardEl, () => {
    itemEl.remove();
    if (hadFocus) {
      nextFocusTarget?.focus();
    }
  });
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/scoped-component-transitions.md#L48-L119). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
