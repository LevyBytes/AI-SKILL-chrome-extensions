[Complete example](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/digital-signatures/guide.md#L140-L241). Related sections: [3. Sign and verify payloads](sign-verify-payloads.md) · [Signing and verifying payloads](signing-and-verifying-payloads.md).
## Fallback strategies

{# {{ BASELINE_STATUS("tmp-webcrypto-modern-algos") }} #}
{{ BASELINE_STATUS("web-cryptography") }}
{{ BASELINE_STATUS("web-cryptography", "api.SubtleCrypto.sign.ed25519") }}

If your Baseline target does not yet support `SubtleCrypto.supports()` or ML-DSA, detect support using the **static** `SubtleCrypto.supports()` method and fall back to classical `'Ed25519'` (or `'ECDSA'` with `'P-256'` and `'SHA-256'` when targeting browsers prior to `'Ed25519'` support):

- **Call `SubtleCrypto.supports()` on the `SubtleCrypto` constructor, not on `crypto.subtle`**: `globalThis.SubtleCrypto?.supports?.('sign', 'ML-DSA-65')` is a synchronous static method returning a boolean (`crypto.subtle.supports` is `undefined`). Probe `'sign'`, `'verify'`, `'generateKey'`, `'importKey'`, `'exportKey'`, or `'getPublicKey'` (or pass a `ContextParams` dictionary such as `SubtleCrypto.supports('sign', { name: 'ML-DSA-65', context })`).
- **Key format in the fallback (`'raw'`)**: While browsers that support Modern WebCrypto also accept `'raw-public'` on `'Ed25519'` and `'ECDSA'`, use `'raw'` in fallback paths targeting older browsers.
- **Domain separation in the fallback**: Classical WebCrypto algorithms (`'Ed25519'` and `'ECDSA'`) do not read a `context` property from the algorithm dictionary (WebIDL silently ignores unknown dictionary properties on `Algorithm` and `EcdsaParams`). Prepend a length-prefixed `context` header to the payload in your fallback path so domain separation behaves consistently across both suites.

```javascript
const ML_DSA_PUBLIC_KEY_ALGORITHMS = {
  1312: 'ML-DSA-44',
  1952: 'ML-DSA-65',
  2592: 'ML-DSA-87',
};

export function supportsPostQuantumSignatures() {
  return (
    typeof globalThis.SubtleCrypto?.supports === 'function' &&
    SubtleCrypto.supports('sign', 'ML-DSA-65')
  );
}

export async function generateSigningKeyPair() {
  if (supportsPostQuantumSignatures()) {
    const keyPair = await crypto.subtle.generateKey('ML-DSA-65', false, ['sign', 'verify']);
    const publicKeyBytes = new Uint8Array(
      await crypto.subtle.exportKey('raw-public', keyPair.publicKey),
    );
    return {
      suite: 'ML-DSA-65',
      keyFormat: 'raw-public',
      keyPair,
      publicKeyBytes,
    };
  }

  // Classical fallback: Ed25519
  const keyPair = await crypto.subtle.generateKey('Ed25519', false, ['sign', 'verify']);
  const publicKeyBytes = new Uint8Array(await crypto.subtle.exportKey('raw', keyPair.publicKey));
  return {
    suite: 'Ed25519',
    keyFormat: 'raw',
    keyPair,
    publicKeyBytes,
  };
}

function frameFallbackInput(payloadBytes, contextBytes) {
  if (contextBytes.byteLength > 255) {
    throw new DOMException('Context must not exceed 255 bytes', 'OperationError');
  }
  const framed = new Uint8Array(1 + contextBytes.byteLength + payloadBytes.byteLength);
  framed[0] = contextBytes.byteLength;
  framed.set(contextBytes, 1);
  framed.set(payloadBytes, 1 + contextBytes.byteLength);
  return framed;
}

```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/digital-signatures/guide.md#L128-L189). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
