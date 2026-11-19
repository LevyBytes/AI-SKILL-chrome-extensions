# JavaScript

Modern JavaScript and Web platform runtimes provide built-in primitives for deep cloning, non-mutating collection transforms, asynchronous coordination, query-string parsing, binary text encoding, and DOM mutation. Replacing legacy userland workarounds (`JSON.parse(JSON.stringify(...))`, `[...arr].sort()`, `.reduce()` bucket accumulators, manual `AbortController` timers, and `innerHTML = ''` clearing loops) eliminates subtle data corruption, prototype pollution, call-stack overflows, and unnecessary parser overhead.

## Table of Contents

- [Use-Case Guide Matrix](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/js/js.md#use-case-guide-matrix)

1. [Immutable Data, Deep Cloning, and Grouping](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/js/js.md#1-immutable-data-deep-cloning-and-grouping)
   - [Deep Cloning with `structuredClone()`](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/js/js.md#deep-cloning-with-structuredclone)
   - [Non-Mutating Array Copies and Reverse Search](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/js/js.md#non-mutating-array-copies-and-reverse-search)
   - [Grouping Iterable Collections (`Object.groupBy()` and `Map.groupBy()`)](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/js/js.md#grouping-iterable-collections-objectgroupby-and-mapgroupby)
2. [Asynchronous Coordination, Cancellation, and Error Chaining](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/js/js.md#2-asynchronous-coordination-cancellation-and-error-chaining)
   - [Externalized Promise Settlement (`Promise.withResolvers()`)](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/js/js.md#externalized-promise-settlement-promisewithresolvers)
   - [Declarative Timeout and Composite Cancellation (`AbortSignal.timeout()` and `AbortSignal.any()`)](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/js/js.md#declarative-timeout-and-composite-cancellation-abortsignaltimeout-and-abortsignalany)
   - [Chaining Error Causes with Error Cause Options](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/js/js.md#chaining-error-causes-with-error-cause-options)
3. [URL Query Manipulation and Binary Text Encoding](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/js/js.md#3-url-query-manipulation-and-binary-text-encoding)
   - [Parsing and Constructing Query Strings (`URLSearchParams`)](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/js/js.md#parsing-and-constructing-query-strings-urlsearchparams)
   - [Binary UTF-8 Text Decoding and Encoding (`TextDecoder` and `TextEncoder`)](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/js/js.md#binary-utf-8-text-decoding-and-encoding-textdecoder-and-textencoder)
4. [DOM Child Replacement and Custom Events](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/js/js.md#4-dom-child-replacement-and-custom-events)
   - [Atomic Child Replacement and Clearing (`Element.prototype.replaceChildren()`)](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/js/js.md#atomic-child-replacement-and-clearing-elementprototypereplacechildren)
   - [Constructing Standard and Custom Events (`new Event()` and `new CustomEvent()`)](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/js/js.md#constructing-standard-and-custom-events-new-event-and-new-customevent)

## Use-Case Guide Matrix

For specialized temporal, scheduling, and security workflows, consult the dedicated guides below:

| Workflow / Domain | Guide |
| :--- | :--- |
| Calculating exact calendar durations (`years`, `months`, `days`) between dates or events | `calculate-event-differentials` (via `npx -y modern-web-guidance@latest retrieve "calculate-event-differentials"`) |
| Representing calendar dates (`PlainDate`), wall-clock times (`PlainTime`), or recurring rules without time-zone shift bugs | `capture-location-agnostic-data` (via `npx -y modern-web-guidance@latest retrieve "capture-location-agnostic-data"`) |
| Converting instants across IANA time zones (`ZonedDateTime`) with DST disambiguation | `coordinate-global-events` (via `npx -y modern-web-guidance@latest retrieve "coordinate-global-events"`) |
| Sorting and comparing nanosecond-precision timestamps (`Temporal.Instant.compare`) | `sort-high-precision-timestamps` (via `npx -y modern-web-guidance@latest retrieve "sort-high-precision-timestamps"`) |
| Projecting dates into non-Gregorian calendar systems (`hebrew`, `islamic-civil`, `japanese`, `chinese`) | `support-global-calendar-systems` (via `npx -y modern-web-guidance@latest retrieve "support-global-calendar-systems"`) |
| Sanitizing untrusted HTML strings before DOM insertion | `sanitize-untrusted-html` (via `npx -y modern-web-guidance@latest retrieve "sanitize-untrusted-html"`) |

---

## 1. Immutable Data, Deep Cloning, and Grouping

### Deep Cloning with `structuredClone()`

Use `structuredClone(value)` to deep-copy nested objects, arrays, and built-in platform types without round-tripping through a JSON string.

#### Guidelines

- **DO** use `structuredClone(value)` instead of `JSON.parse(JSON.stringify(value))` or recursive cloning utilities (`_.cloneDeep`) when copying structured state in memory.
- **DO** rely on `structuredClone()` to preserve cyclic references, shared object references (DAGs), `Date` instances, `RegExp`, `Map`, `Set`, `ArrayBuffer`, `TypedArray`, `DataView`, `BigInt`, `Error` instances, `undefined` property values, `NaN`, `Infinity`, `-0`, and sparse array holes.
- **DO** pass a `{ transfer: [arrayBuffer] }` options object when moving ownership of `ArrayBuffer` or `MessagePort` instances without copying underlying bytes.
- **DO NOT** replace `JSON.parse(JSON.stringify(value))` with `structuredClone(value)` when callers depend on **JSON wire normalization** or transforms:
  - Converting `Date` instances to ISO-8601 strings (`Date.prototype.toJSON()`), or running `JSON.stringify` `replacer` allowlists/redactions or `JSON.parse` `reviver` transforms.
  - Invoking custom `.toJSON()` methods on objects (`structuredClone()` ignores inherited or non-enumerable `.toJSON()` methods and throws `DataCloneError` if an object has own enumerable function properties such as `.toJSON` or imported library singleton/options methods).
  - Stripping keys whose values are `undefined`, Functions, or `Symbol`s, converting `NaN`, `Infinity`, `-Infinity`, and sparse array holes to `null` (and `-0` to `+0`), or intentionally breaking shared DAG references (`a.x !== a.y` so callers can mutate aliased branches independently).
- **DO NOT** pass non-cloneable values to `structuredClone()`. It throws a `DOMException` (`DataCloneError`) on:
  - Functions or imported library singletons/options objects with own enumerable methods (whereas `JSON.stringify` silently omits function properties on objects or turns array elements into `null`).
  - `Symbol` values or `Symbol`-keyed properties (which `JSON.stringify` silently ignores).
  - DOM nodes (`Element`, `Document`, `Node`), live browser/WebIDL objects (`window.location`, `localStorage`, `element.dataset` (`DOMStringMap`), `getComputedStyle(el)` (`CSSStyleDeclaration`), DOM `Event`, `URLSearchParams`, `FormData`, `Headers`—whereas serializable geometry objects like `DOMRect` do clone), `Promise`, `WeakMap`, `WeakSet`, or any `Proxy` instance (both generic `Proxy` wrappers and reactive stores such as Vue `reactive()` or MobX observables).
- **DO NOT** expect `structuredClone()` to preserve custom class prototypes, class methods, non-enumerable properties, property descriptors, or `#private` fields. Like `JSON.parse(JSON.stringify(...))`, `structuredClone()` strips custom prototype chains to `Object.prototype`, drops non-enumerable properties and `#private` fields, and evaluates enumerable getters once into plain data properties.

> [!NOTE]
> `structuredClone` is a host-provided global rather than an intrinsic ECMAScript language global. In isolated Node.js `vm.createContext({})` sandboxes or legacy custom test environments that do not expose host globals on the context object, `structuredClone` may be `undefined` unless explicitly injected into the context.

#### Code Example

```js
const original = {
  id: 'session-42',
  createdAt: new Date('2026-03-15T12:00:00Z'),
  tags: new Set(['admin', 'audit']),
  metrics: new Float64Array([0.98, 0.99]),
  optionalNote: undefined,
};
original.self = original; // Circular reference

const copy = structuredClone(original);

console.assert(copy !== original);
console.assert(copy.createdAt instanceof Date);
console.assert(copy.tags instanceof Set && copy.tags !== original.tags);
console.assert(copy.self === copy);
console.assert('optionalNote' in copy && copy.optionalNote === undefined);
```

---

### Non-Mutating Array Copies and Reverse Search

Use the copying array methods (`.toSorted()`, `.toReversed()`, `.toSpliced()`, `.with()`) and reverse search methods (`.findLast()`, `.findLastIndex()`) to transform or query arrays without mutating the source reference or allocating intermediate shallow clones.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/js/js.md#L1-L89). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
