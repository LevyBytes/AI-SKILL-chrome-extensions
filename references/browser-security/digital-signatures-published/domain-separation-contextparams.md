### Domain separation with `ContextParams`

To prevent a signature created for one purpose from being replayed in another part of your application or protocol that shares the same key pair, bind the signature to a domain-separation `context`.

Instead of a bare algorithm name string, pass a `ContextParams` dictionary (`{ name, context }`) to `sign()` and `verify()`, where `context` is a `BufferSource` (`Uint8Array` or `ArrayBuffer`):

```javascript
const contextBytes = new TextEncoder().encode('release-manifest-v1');

const signatureBuffer = await crypto.subtle.sign(
  {
    name: 'ML-DSA-65',
    context: contextBytes,
  },
  signerKeyPair.privateKey,
  payloadBytes,
);

const isValid = await crypto.subtle.verify(
  {
    name: 'ML-DSA-65',
    context: contextBytes,
  },
  verifierPublicKey,
  signatureBuffer,
  payloadBytes,
);
```

- **255-byte limit**: `context` accepts `0` to `255` bytes (omitting `context` is equivalent to passing an empty `new Uint8Array(0)`). Passing more than `255` bytes rejects with `OperationError`.
- **Exact match required**: `crypto.subtle.verify()` returns `true` only when the verifier passes the exact same `context` bytes used during `crypto.subtle.sign()`.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/security/digital-signatures.md#L88-L119). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
