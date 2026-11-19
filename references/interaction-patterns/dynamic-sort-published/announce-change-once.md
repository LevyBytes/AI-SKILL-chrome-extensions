Related section: [Dynamic sort](overview.md).
## Announce the change once

Reordering moves many nodes, but the user performed one action. **DO NOT** put `aria-live` on the list, which would announce every moved item. Instead:

* Add one visually hidden `role="status"` element and set its text once per reorder, after starting the update. It must already be in the DOM before its text changes.
* Name the result, not the mechanism: "Sorted by price, low to high, 24 items".
* Keep focus on the control that triggered the change. Do not move focus into the list.
* Make the current order readable from the control itself, so a screen reader user who lands on it hears what is selected without searching the page. Native controls (`<select>`, radios) do this already; for toggle buttons use `aria-pressed` and label the current state, not the action.

```html
<p id="reorder-status" role="status" class="visually-hidden"></p>
```

```css
/* Hides the status text visually but keeps it available to screen readers. Do not use display: none. */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
```

```javascript
reorderWithTransition(list, orderedNodes);
// Set the message once, not once per item.
status.textContent = `Sorted by price, low to high, ${orderedNodes.length} items`;
```

## Performance on large lists

* Layout and rendering are the cost, not computing the order. Reorder nodes in a single pass with no layout reads (`offsetTop`, `getBoundingClientRect()`) in the loop.
* Add `content-visibility: auto` with `contain-intrinsic-size` to items in long lists so off-screen items skip rendering work.
* Above roughly a thousand items, virtualize the list instead of keeping every node in the DOM. Skip the view transition when virtualizing.
* For expensive reorders (very large lists, or an order set through several inputs), apply the new order only when the user confirms it, for example with an Apply button, instead of on every input change.

## Fallbacks

Browser support for Element-scoped view transitions: Limited availability.
Supported by: Chrome 147 (Apr 2026) and Edge 147 (Apr 2026).
Unsupported in: Firefox and Safari.

If your Baseline target does not support `element.startViewTransition()`, use `document.startViewTransition()`. If it does not support that either, reorder without animation. The list still sorts correctly and the announcement is unchanged, so this is graceful degradation: the animation enhances the use case but is not core to it.

Browser support for moveBefore(): Limited availability.
Supported by: Chrome 133 (Feb 2025), Edge 133 (Feb 2025), and Firefox 144 (Oct 2025).
Unsupported in: Safari.

If your Baseline target does not support `moveBefore()`, use `append()`. DOM order is identical; items may lose focus, iframe, or animation state inside them, which only matters when items contain such state.

```javascript
function reorder(container, orderedNodes) {
  const move = Object.hasOwn(Element.prototype, 'moveBefore')
    ? (node) => container.moveBefore(node, null)
    : (node) => container.append(node);

  for (const node of orderedNodes) move(node);
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/dynamic-sort.md#L71-L131). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
