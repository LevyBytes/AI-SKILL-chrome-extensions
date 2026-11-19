## 3. Distinguish and Pin Opaque Origins (`origin.opaque` and `Origin.from(event)`)

Sandboxed iframes (`<iframe sandbox="allow-scripts">`), `data:` URLs, and `new Origin()` produce **opaque origins** (`origin.opaque === true`). While their string serialization is always `"null"`, `Origin.from(event)` extracts the sender's actual underlying opaque origin from a browser-dispatched `MessageEvent`:

- Two messages sent from the **same** sandboxed iframe yield `Origin` objects that are `isSameOrigin()` with each other (`true`).
- Messages sent from **different** sandboxed iframes—or separate `Origin.from('data:...')` / `new Origin()` calls—yield distinct opaque origins that evaluate `isSameOrigin()` to `false`, preventing `"null" === "null"` spoofing across unrelated opaque contexts.
- `new Origin()` creates a fresh, unique opaque origin that matches nothing except itself, which is useful as a default deny-all sentinel before an expected peer origin is pinned once on initialization.

```javascript
// Initialize with a unique opaque sentinel that matches no other origin
let pinnedSandboxOrigin = new Origin();
let isSandboxPinned = false;

export function handleSandboxedWidgetMessage(event, expectedWidgetWindow) {
  try {
    const senderOrigin = Origin.from(event);

    // Pin the opaque origin only once on initialization from the expected sandboxed iframe
    if (!isSandboxPinned && event.source === expectedWidgetWindow && event.data?.type === 'init') {
      pinnedSandboxOrigin = senderOrigin;
      isSandboxPinned = true;
    }

    // Subsequent messages from the SAME sandboxed iframe match pinnedSandboxOrigin;
    // messages from any other sandboxed iframe (also event.origin === "null") return false.
    return senderOrigin.isSameOrigin(pinnedSandboxOrigin);
  } catch {
    return false;
  }
}
```

## Best practices

- **DO** convert both sides of a comparison to `Origin` instances via `Origin.from()` before calling `isSameOrigin(other)` or `isSameSite(other)`.
- **DO** pass a browser-dispatched `MessageEvent` directly to `Origin.from(event)` when you need to preserve opaque origin identity, and use `Origin.from(self)` (rather than `Location` or `Document`, which throw `TypeError`) to obtain the current execution context's `Origin`.
- **DO** wrap `Origin.from()` calls on untrusted or runtime inputs in a `try...catch` block so invalid URLs, `"null"` strings, or unsupported objects safely return `false` instead of throwing an uncaught `TypeError`.
- **DO NOT** compare two runtime `event.origin` or `url.origin` strings directly without first rejecting `"null"` (`origin !== 'null'`), as two unrelated opaque origins both serialize to `"null"`.
- **DO NOT** validate origins or sites with `startsWith()`, `includes()`, `endsWith()`, or naive `.split('.')` hostname slicing.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/security/validate-origins.md#L88-L127). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
