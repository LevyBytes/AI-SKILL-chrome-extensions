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

#### Code Example

```js
export class ProfileLoadError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = 'ProfileLoadError';
  }
}

export async function loadUserProfile(userId, readRecord) {
  try {
    const raw = await readRecord(`users:${userId}`);
    return JSON.parse(raw);
  } catch (err) {
    throw new ProfileLoadError(
      `Failed to load profile for user "${userId}": ${err.message}`,
      { cause: err },
    );
  }
}
```

---

## 3. URL Query Manipulation and Binary Text Encoding

### Parsing and Constructing Query Strings (`URLSearchParams`)

Use `URLSearchParams` (and `new URL(input, base).searchParams`) to parse, inspect, mutate, and serialize query strings instead of manual `.split('&')` / `.split('=')` loops and `decodeURIComponent`.

#### Guidelines

- **DO** use `new URLSearchParams(search)` to read or mutate parameters (`.get(key)`, `.getAll(key)`, `.has(key)`, `.set(key, value)`, `.toString()`) or convert to a plain key-value dictionary with `Object.fromEntries(new URLSearchParams(search))`.
- **DO** use `new URL(fullUrl, baseOrigin).searchParams` when starting from a full URL string (`https://example.com/path?a=1#section`) rather than passing a full URL directly to `new URLSearchParams(fullUrl)` (which only strips a single leading `?` and treats `https://example.com/path?a` as part of the first key name).
- **DO** rely on `URLSearchParams` to preserve `=` characters inside parameter values (such as Base64 padding `?token=aGVsbG8=`, which `.split('=')[1]` truncates) and to avoid `Object.prototype` pollution when building lookup maps.
- **DO** account for the `application/x-www-form-urlencoded` rules enforced by `URLSearchParams`:
  - **Plus (`+`) decoding:** `URLSearchParams` decodes `+` as a space (`' '`), whereas `decodeURIComponent('a+b')` preserves `a+b`. Encode literal `+` values (phone numbers, Base64) as `%2B` at the source when `+` must stay literal.
  - **Valueless flags (`?debug` vs `?debug=`):** Both normalize to `""` (`params.has('debug') === true`, `params.get('debug') === ''`), whereas custom `split('=')` parsers sometimes assign `undefined` or `true`.
  - **Duplicate keys (`?tag=a&tag=b`):** `params.get('tag')` returns the **first** value (`'a'`), `Object.fromEntries(params)` retains the **last** value (`'b'`), and `params.getAll('tag')` returns `['a', 'b']`.
  - **Invalid percent-encoding, bracket keys, and `'??'`:** Non-hex escapes (`%ZZ`) stay literal `'%ZZ'` and invalid UTF-8 byte sequences (`%E0%A4%A`) become `\uFFFD` without throwing (keep `decodeURIComponent` inside `try / catch` when strict malformed-URI rejection is required); bracket keys (`?ids[]=1&user[name]=alice`) remain flat literal keys; and only a single leading `?` is stripped (`new URLSearchParams('??a=1')` keeps `'?a'` as the first key).
- **DO NOT** pass `location.hash` or hash-routing fragments directly to `new URLSearchParams(...)`: `URLSearchParams` does not strip `#`, so `'#tab=2'` parses the key as `'#tab'` (use `slice(1)`), and hash-routing fragments (`'#/route?a=1'`) require extracting the query segment after `?` before parsing (`hash.slice(hash.indexOf('?') + 1)`).
- **DO NOT** use `URLSearchParams` to parse semicolon-delimited strings (such as `document.cookie` or RFC 6265 `Cookie` headers); `URLSearchParams` splits exclusively on `&`.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/js/js.md#L186-L276). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
