#### Code Example

```js
// Parsing a query string into a plain object (last value wins on duplicate keys)
const query = '?filter=active&token=eyJhbGciOiJIUzI1NiJ9==&tag=js&tag=web';
const params = new URLSearchParams(query);

const token = params.get('token'); // 'eyJhbGciOiJIUzI1NiJ9==' (preserves trailing '==')
const allTags = params.getAll('tag'); // ['js', 'web']
const lastWinsDict = Object.fromEntries(params); // { filter: 'active', token: '...', tag: 'web' }

// Mutating query parameters on a full URL safely
const endpoint = new URL('https://api.example.com/v1/items?page=1#results');
endpoint.searchParams.set('page', '2');
endpoint.searchParams.append('limit', '50');
```

---

### Binary UTF-8 Text Decoding and Encoding (`TextDecoder` and `TextEncoder`)

Use `TextDecoder` and `TextEncoder` to convert between `Uint8Array` byte buffers and JavaScript strings.

#### Guidelines

- **DO** use `new TextDecoder().decode(bytes)` instead of `decodeURIComponent(escape(binaryString))`, `String.fromCharCode.apply(null, bytes)`, or `String.fromCharCode(...bytes)` when decoding UTF-8 byte buffers into text (`String.fromCharCode` treats bytes as UTF-16 code units—corrupting multi-byte UTF-8 into Latin-1 mojibake and overflowing the call stack at ~65 KB+—while `Uint16Array` elements `> 0xFF` represent 16-bit code units rather than raw UTF-8 bytes).
- **DO** use `new TextEncoder().encode(str)` to encode strings into UTF-8 `Uint8Array` byte arrays instead of manual character-code loops.
- **DO** reuse a single `TextDecoder` instance with `decoder.decode(chunk, { stream: true })` for chunked streams (`ReadableStream`, WebSocket frames, file chunks), followed by a final `decoder.decode()` flush call, so multi-byte code points split across chunk boundaries reassemble cleanly.
- **DO** pass `{ fatal: true }` when invalid UTF-8 sequences must throw `TypeError` instead of `\uFFFD` (note `TypeError` rather than `URIError`, and `decoder.decode(string)` always throws `TypeError`), and pass `{ ignoreBOM: true }` when a leading UTF-8 BOM (`0xEF 0xBB 0xBF`) must not be stripped by default.
- **DO** use `new TextDecoder('latin1')` (or `'iso-8859-1'`) only when a 1-byte-per-character mapping is needed on large buffers without call-stack limits, noting that per WHATWG Encoding both labels map to `windows-1252` (decoding bytes `0x80`–`0x9F` as characters such as `€` (`\u20AC`) rather than `\u0080`–`\u009F`).
- **DO NOT** replace `String.fromCharCode` with `new TextDecoder('utf-8')` when constructing a raw 1-byte-per-code-unit binary string (`0x00`–`0xFF`) for `btoa()` / `atob()`: use `TextEncoder` / `TextDecoder` for UTF-8 text payloads and chunked `String.fromCharCode` (or Node.js `Buffer.from(bytes).toString('base64')`) for raw binary strings passed to `btoa()`, since passing multi-byte UTF-8 `TextDecoder` output to `btoa()` throws `InvalidCharacterError`.

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
- **DO NOT** replace `while (el.firstElementChild) el.removeChild(el.firstElementChild)` when inline `Text` or `Comment` nodes must remain intact (`replaceChildren()` removes all `childNodes`), do not replace chained assignments (`a.innerHTML = b.innerHTML = ''`, since `replaceChildren()` returns `undefined`), do not pass raw HTML markup strings (`'<li>Item</li>'`) expecting parsed elements (for untrusted HTML strings, follow `sanitize-untrusted-html` (via `npx -y modern-web-guidance@latest retrieve "sanitize-untrusted-html"`)), do not pass a live `HTMLCollection`/`NodeList` (`source.children`) when `source` must keep copies, and do not replace `element.innerHTML = ''` on `<object>` or `<embed>` plugin containers or test harnesses asserting HTML parser steps.

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


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/js/js.md#L277-L369). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
