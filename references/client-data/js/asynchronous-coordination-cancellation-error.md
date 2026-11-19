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

### Declarative Timeout and Composite Cancellation (`AbortSignal.timeout()` and `AbortSignal.any()`)

Use `AbortSignal.timeout(ms)` for time-bounded asynchronous operations and `AbortSignal.any(signals)` to combine multiple cancellation sources without manual timer bookkeeping.

#### Guidelines

- **DO** pass `{ signal: AbortSignal.timeout(ms) }` directly to `fetch()`, `addEventListener()`, streams, or abortable APIs instead of creating a one-off `AbortController` and `setTimeout(() => controller.abort(), ms)`.
- **DO** combine user-initiated cancellation (`AbortController`) with a deadline using `AbortSignal.any([controller.signal, AbortSignal.timeout(ms)])`. The composite signal aborts as soon as the first input signal aborts and propagates that signal's `reason`.
- **DO** check for both `'TimeoutError'` and `'AbortError'` when inspecting `error.name` in `catch` blocks if distinguishing user cancellation from a deadline matters.
- **DO NOT** assume `AbortSignal.timeout(ms)` aborts with `error.name === 'AbortError'`. Whereas `controller.abort()` without arguments sets `signal.reason` to `DOMException(..., 'AbortError')`, `AbortSignal.timeout(ms)` sets `DOMException(..., 'TimeoutError')` (`error.name === 'TimeoutError'`, `err.code === DOMException.TIMEOUT_ERR` / `23`).
- **DO NOT** pass `0`-arg or negative delays to `AbortSignal.timeout(ms)` (omitting `ms` throws `TypeError`; negative delays throw `RangeError` or `TypeError`), do not expect `AbortSignal.timeout(ms)` to keep a Node.js event loop alive on its own (Node.js uses an unref'd timer), and do not replace manual `AbortController` + `setTimeout` timers that reset on activity (sliding/idle debounce) or require a custom abort reason before expiry.

#### Code Example

```js
export async function fetchJsonWithDeadline(url, userSignal, timeoutMs = 5_000) {
  const signal = userSignal
    ? AbortSignal.any([userSignal, AbortSignal.timeout(timeoutMs)])
    : AbortSignal.timeout(timeoutMs);

  try {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }
    return await response.json();
  } catch (err) {
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      throw new Error(`Request to ${url} timed out after ${timeoutMs}ms`, { cause: err });
    }
    throw err;
  }
}
```

---

### Chaining Error Causes with Error Cause Options

Attach the original caught error via the `{ cause }` options parameter whenever wrapping and re-throwing an exception across architectural layers.

#### Guidelines

- **DO** pass `{ cause: err }` as the second argument to `new Error(message, { cause: err })` (or built-in subclasses: `TypeError`, `RangeError`, `SyntaxError`, `URIError`, `EvalError`, `AggregateError`); custom `Error` subclasses must accept and forward `(message, options)` to `super(message, options)` to preserve `.cause`.
- **DO** replace string-concatenated re-throws (`new Error('Failed: ' + err.message)`) with `new Error(message, { cause: err })` when concatenation was used solely as a substitute for structured error chaining—and retain interpolated `${err.message}` alongside `{ cause: err }` whenever callers or tests assert on the outer `.message` substring—rather than mutating `wrapper.cause = err` after construction (which sets an enumerable property instead of the non-enumerable spec property).
- **DO NOT** expose raw internal `cause` chains directly to untrusted client responses if the underlying error contains sensitive database queries, file paths, or credentials; log the full `error.cause` chain server-side and sanitize client-facing payloads.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/js/js/guide.md#L177-L250). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
