### Constructing Standard and Custom Events (`new Event()` and `new CustomEvent()`)

Use `new Event(type, options)`, `new CustomEvent(type, options)`, and specialized WebIDL event constructors instead of the deprecated `document.createEvent()` and `initEvent()` / `initCustomEvent()` methods.

#### Guidelines

- **DO** use `new Event(type, { bubbles, cancelable, composed })` for standard notifications, `new CustomEvent(type, { detail, bubbles, cancelable, composed })` for structured `event.detail` payloads, and specialized WebIDL constructors (`new MouseEvent()`, `new KeyboardEvent()`, `new UIEvent()`) when replacing `initMouseEvent` / `initKeyboardEvent` / `initUIEvent` (avoiding legacy `initKeyboardEvent` argument quirks and read-only `keyCode === 0` issues).
- **DO** specify `bubbles: true` and `cancelable: true` explicitly whenever an event must bubble up the DOM tree or support `event.preventDefault()` (both default to `false`), and set `composed: true` when crossing a Shadow DOM boundary.
- **DO NOT** use `document.createEvent('Event')`, `document.createEvent('CustomEvent')`, `event.initEvent()`, or `event.initCustomEvent()`, and do not pass non-`EventTarget` values for WebIDL dictionary fields (e.g., `relatedTarget: 0` in `MouseEventInit` throws `TypeError`).

#### Code Example

```js
// Dispatching a bubbling, shadow-piercing custom event with payload data
export function notifyFilterChange(filterPanel) {
  const filterChanged = new CustomEvent('filter-change', {
    detail: { category: 'architecture', minScore: 80 },
    bubbles: true,
    cancelable: true,
    composed: true,
  });

  return filterPanel.dispatchEvent(filterChanged);
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/js/js.md#L370-L394). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
