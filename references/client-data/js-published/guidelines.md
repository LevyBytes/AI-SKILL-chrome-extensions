#### Guidelines

- **DO** use `array.toSorted(compareFn)` instead of `[...array].sort(compareFn)`, `array.slice().sort(compareFn)`, or `Array.from(array).sort(compareFn)`.
- **DO** use `array.toReversed()` instead of `[...array].reverse()` or `array.slice().reverse()`.
- **DO** use `array.toSpliced(start, deleteCount, ...items)` for immutable insertions, deletions, and replacements instead of cloning and calling `.splice()`.
- **DO** use `array.with(index, value)` (which supports negative indices) for single-index immutable updates instead of copying and assigning `clone[index] = value`.
- **DO** use `array.findLast(predicate)` and `array.findLastIndex(predicate)` instead of `[...array].reverse().find(predicate)` or reversing indices manually.
- **DO NOT** refactor `arr.slice().reverse().findIndex(fn)` without auditing multi-argument callbacks and `-1` miss math: `findLast()`/`findLastIndex()` pass the **original** forward `index` to `(item, index, arr)` rather than the reversed-copy index, and `arr.length - 1 - (-1) === arr.length` evaluates to an out-of-bounds index on a miss whereas `findLastIndex()` returns `-1`.
- **DO NOT** drop `[...iterable]` / `Array.from()` conversion when the receiver is a `string`, non-Array iterable, or array-like object (`Set`, `Map.keys()`, `Map.values()`, generator, `NodeList`, `HTMLCollection`, or `arguments`). Calling `.toSorted()` or `.toReversed()` directly on a `string`, `Set`, or `NodeList` throws a `TypeError`; convert first and chain the mutating method (`[...set].sort(compareFn)`, `[...nodeList].reverse()`, or `Array.from(str).toReversed().join('')`) rather than allocating redundant copies.
- **DO NOT** replace `[...typedArray].sort()` with `typedArray.toSorted()` unless numeric ordering and a `TypedArray` return type are intended:
  - `Array.prototype.sort()` / `.toSorted()` converts elements to UTF-16 strings by default (`[10, 2].toSorted()` yields `[10, 2]`), whereas `%TypedArray%.prototype.toSorted()` sorts numerically (`new Uint8Array([10, 2]).toSorted()` yields `Uint8Array [2, 10]`) and returns a `TypedArray` instead of a plain `Array`.
  - `%TypedArray%.prototype` does **not** implement `.toSpliced()` (because TypedArrays have fixed byte lengths).
- **DO NOT** use `.toSorted()` or `.toReversed()` when code intentionally relies on sparse array hole preservation (`!(i in arr)`). Copying methods always produce dense arrays where sparse holes become `undefined` elements (`0 in [, 1].toReversed()` is `true`), whereas `Array.prototype.slice()`, `.sort()`, and `.reverse()` preserve empty slots.

#### Code Example

```js
const tasks = [
  { id: 1, priority: 2, status: 'done' },
  { id: 2, priority: 5, status: 'open' },
  { id: 3, priority: 1, status: 'done' },
];

// Immutable sort and single-element update without mutating `tasks`
const byPriority = tasks.toSorted((a, b) => b.priority - a.priority);
const reopened = tasks.with(-1, { ...tasks.at(-1), status: 'open' });

// Reverse search without allocating a reversed copy
const lastCompleted = tasks.findLast((task) => task.status === 'done');
const lastCompletedIndex = tasks.findLastIndex((task) => task.status === 'done');
```

---

### Grouping Iterable Collections (`Object.groupBy()` and `Map.groupBy()`)

Use `Object.groupBy(items, callbackFn)` and `Map.groupBy(items, callbackFn)` to partition any iterable into array buckets in a single step.

#### Guidelines

- **DO** use `Object.groupBy(items, (item, index) => key)` instead of `items.reduce((acc, item) => { (acc[key] ??= []).push(item); return acc; }, {})` when grouping into string or symbol property keys and each bucket holds unmodified original elements (`Object.groupBy()` uses `CreateDataProperty`, so keys like `'constructor'` or `'toString'` never collide with `Object.prototype`).
- **DO** use `Map.groupBy(items, (item, index) => key)` when grouping by object references, class instances, or primitive keys whose non-string types (`number`, `boolean`, `undefined`, `BigInt`) must be preserved without `ToPropertyKey` coercion (`Object.groupBy()` coerces keys with `String(key)`, turning objects into `'[object Object]'`).
- **DO** use `Object.hasOwn(groups, key)` or nullish coalescing (`groups[key] ?? []`) when reading buckets from `Object.groupBy()`.
- **DO NOT** call `Object.prototype` methods (`groups.hasOwnProperty(key)`) or rely on `grouped instanceof Object` on `Object.groupBy()` results: it returns a `null`-prototype object (`Object.getPrototypeOf(grouped) === null`, `grouped instanceof Object === false`), so `groups.hasOwnProperty` is `undefined` and calling it throws a `TypeError`.
- **DO NOT** replace `.reduce()` accumulators that simultaneously transform elements (`acc[key].push(item.id)`), compute scalar aggregations (counts, sums, min/max), or pre-seed empty keys that have zero matching items (`Object.groupBy()` only creates keys that appear at least once in `items`).

#### Code Example

```js
const deliveries = [
  { id: 'd1', region: 'eu-west', weightKg: 4.2 },
  { id: 'd2', region: 'us-east', weightKg: 1.1 },
  { id: 'd3', region: 'eu-west', weightKg: 8.5 },
];

// String-keyed null-prototype dictionary of arrays
const byRegion = Object.groupBy(deliveries, (item) => item.region);
const euShipments = byRegion['eu-west'] ?? [];

// Non-string or object keys preserved in a Map
const heavyKey = { tier: 'heavy' };
const standardKey = { tier: 'standard' };
const byTier = Map.groupBy(deliveries, (item) =>
  item.weightKg >= 5 ? heavyKey : standardKey,
);
```

---

## 2. Asynchronous Coordination, Cancellation, and Error Chaining

### Externalized Promise Settlement (`Promise.withResolvers()`)

Use `Promise.withResolvers()` when a promise's `resolve` and `reject` callbacks must be stored or invoked outside the `new Promise` executor scope (such as in event listeners, worker message handlers, stream queues, or cancellation tokens).

#### Guidelines

- **DO** use `const { promise, resolve, reject } = Promise.withResolvers()` instead of declaring mutable outer variables (`let resolve, reject; const promise = new Promise((res, rej) => { resolve = res; reject = rej; });`), or `Promise.withResolvers.call(SubPromise)` when constructing a `Promise` subclass.
- **DO** keep standard `new Promise((resolve, reject) => { ... })` when the asynchronous operation is self-contained inside the executor callback.
- **DO NOT** move synchronous setup code out of a `new Promise((resolve, reject) => { ... })` executor into `Promise.withResolvers()` without wrapping it in `try / catch` calling `reject(err)`: synchronous throws inside an executor automatically reject the promise, whereas throws after `Promise.withResolvers()` become uncaught synchronous exceptions.

#### Code Example

```js
export function createRequestGate() {
  const { promise, resolve, reject } = Promise.withResolvers();
  return {
    waitUntilReady: () => promise,
    open: (config) => resolve(config),
    abort: (reason) => reject(new Error(`Gate aborted: ${reason}`)),
  };
}
```

---


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/js/js.md#L90-L185). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
