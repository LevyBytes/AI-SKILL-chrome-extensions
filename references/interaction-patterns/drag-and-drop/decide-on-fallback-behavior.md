Related section: [Drag and drop](overview.md).
## Decide on fallback behavior

When reordering is supplementary, keep the collection readable and usable in its default DOM order without JavaScript. If the order represents user-controlled data or directly affects behavior—for example, task priority, playlist order, or workflow sequence—treat reordering as essential and provide the required pointer and keyboard interactions rather than presenting the static order as equivalent behavior.

## Browser support and fallback strategies

### `moveBefore()`

{{ BASELINE_STATUS("move-before") }}

If your Baseline target does not support `moveBefore()`, feature-detect with `'moveBefore' in Element.prototype` and fall back to `referenceNode.before(item)` (or `container.append(item)` when there is no reference node) with the existing item node. Because `before()` removes and reinserts the node, it has two side effects to handle:

- **It drops active pointer capture.** Keep the `pointermove`, `pointerup`, and `pointercancel` listeners on `document`, where captured events still bubble. After the move, re-call `handle.setPointerCapture(event.pointerId)` when `hasPointerCapture()` is false, and end the drag on `lostpointercapture` only if capture is not re-established.
- **It blurs focused descendants.** Explicitly call `.focus()` on the active handle or movement button after moving. Also delay the live-region update by about 500 ms (debounced, clearing the previous message first), because the focus re-announcement otherwise swallows the position announcement in screen readers such as VoiceOver in Safari.

### `reading-flow`

{{ BASELINE_STATUS("reading-flow") }}

In browsers that do not support `reading-flow`, sequential focus navigation follows DOM source order. Structure each item's DOM order so interactive controls appear in a logical reading and tab sequence without relying on CSS visual reordering.

### `user-select`

{{ BASELINE_STATUS("user-select") }}

Include `-webkit-user-select: none` before `user-select: none` on the drag handle so text selection stays suppressed during dragging in Safari.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/drag-and-drop/guide.md#L92-L117). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
