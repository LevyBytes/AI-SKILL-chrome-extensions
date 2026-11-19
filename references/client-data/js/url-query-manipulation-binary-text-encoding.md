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


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/js/js/guide.md#L251-L326). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
