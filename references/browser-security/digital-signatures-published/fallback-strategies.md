[Complete example](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/security/digital-signatures.md#L134-L235). Related sections: [Domain separation with ContextParams](domain-separation-contextparams.md) · [Signing and verifying payloads](signing-and-verifying-payloads.md).
## Fallback strategies

Baseline status for Web Cryptography: Widely available. It's been Baseline since 2017-09-19.
Supported by: Chrome 37 (Aug 2014), Edge 12 (Jul 2015), Firefox 34 (Dec 2014), and Safari 11 (Sep 2017).

Baseline status for the api.SubtleCrypto.sign.ed25519 capability: Newly available. It's been Baseline since 2025-05-29.
Supported by: Chrome 137 (May 2025), Edge 137 (May 2025), Firefox 129 (Aug 2024), and Safari 17 (Sep 2023).

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

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/security/digital-signatures.md#L120-L183). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
