#### Code Example

```js
const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });

// Encode string to UTF-8 Uint8Array and decode back without stack limits
const bytes = encoder.encode('🚀 Modern Web Platform — 100% UTF-8');
const text = decoder.decode(bytes);

// Streaming decode across arbitrary chunk boundaries
export async function readUtf8Stream(readableStream) {
  const streamDecoder = new TextDecoder();
  let output = '';
  for await (const chunk of readableStream) {
    output += streamDecoder.decode(chunk, { stream: true });
  }
  output += streamDecoder.decode(); // Flush any trailing bytes
  return output;
}
```

---

## 4. DOM Child Replacement and Custom Events

### Atomic Child Replacement and Clearing (`Element.prototype.replaceChildren()`)

Use `element.replaceChildren(...nodesOrStrings)` to clear a container or replace all of its existing children in a single operation.

#### Guidelines

- **DO** call `container.replaceChildren()` with no arguments to remove all `childNodes` instead of `container.innerHTML = ''` (which invokes the HTML parser and fails under Trusted Types) or child-removal loops (forward `for` loops over live `children`/`childNodes` skip every other node, and `replaceChildren()` batches mutations into a single `MutationObserver` `childList` record—emitting `0` records on an already-empty element—and fires Custom Element `disconnectedCallback()` via `[CEReactions]` after all removals complete rather than interleaved per node).
- **DO** call `container.replaceChildren(...nodes)` to atomically clear and insert new `Node` instances or `DocumentFragment`s (`HierarchyRequestError` pre-validation fails atomically before mutating existing children).
- **DO** pass plain strings directly to `container.replaceChildren(text)` when inserting literal text without parsing HTML (note `el.replaceChildren('')` inserts an empty `Text` node with `childNodes.length === 1`, unlike `el.replaceChildren()`).
- **DO** target `templateElement.content.replaceChildren(...)` when clearing or replacing the contents of a `<template>` element (calling `templateElement.replaceChildren()` leaves its inert `content` `DocumentFragment` untouched), and narrow `Node` references to `ParentNode` (`Element`, `Document`, `DocumentFragment`) in TypeScript since leaf `Node`s (`Text`, `Comment`) do not implement `replaceChildren()`.
- **DO NOT** replace `while (el.firstElementChild) el.removeChild(el.firstElementChild)` when inline `Text` or `Comment` nodes must remain intact (`replaceChildren()` removes all `childNodes`), do not replace chained assignments (`a.innerHTML = b.innerHTML = ''`, since `replaceChildren()` returns `undefined`), do not pass raw HTML markup strings (`'<li>Item</li>'`) expecting parsed elements (for untrusted HTML strings, follow {{ GUIDE_REF("sanitize-untrusted-html") }}), do not pass a live `HTMLCollection`/`NodeList` (`source.children`) when `source` must keep copies, and do not replace `element.innerHTML = ''` on `<object>` or `<embed>` plugin containers or test harnesses asserting HTML parser steps.

#### Code Example

```js
export function renderNotificationList(listElement, messages) {
  const items = messages.map((msg) => {
    const li = document.createElement('li');
    li.className = 'notification-item';
    li.textContent = msg;
    return li;
  });

  // Atomically replaces all existing <li> children in a single DOM operation
  listElement.replaceChildren(...items);
}

// Clearing a <template> element's inert DocumentFragment
export function clearTemplate(templateEl) {
  templateEl.content.replaceChildren();
}
```

---

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

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/js/js/guide.md#L327-L412). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
