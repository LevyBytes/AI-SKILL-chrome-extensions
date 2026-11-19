Related section: [Drag and drop](overview.md).
### `reading-flow`

Browser support for reading-flow: Limited availability.
Supported by: Chrome 137 (May 2025) and Edge 137 (May 2025).
Unsupported in: Firefox and Safari.

In browsers that do not support `reading-flow`, sequential focus navigation follows DOM source order. Structure each item's DOM order so interactive controls appear in a logical reading and tab sequence without relying on CSS visual reordering.

### `user-select`

Browser support for user-select: Limited availability.
Supported by: Chrome 54 (Oct 2016), Edge 79 (Jan 2020), and Firefox 69 (Sep 2019).
Unsupported in: Safari.

Include `-webkit-user-select: none` before `user-select: none` on the drag handle so text selection stays suppressed during dragging in Safari.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/drag-and-drop.md#L94-L108). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
