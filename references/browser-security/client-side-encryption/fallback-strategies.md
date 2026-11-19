[Complete example](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/client-side-encryption/guide.md#L197-L308). Related sections: [4. Encrypt and decrypt payloads ('ChaCha20-Poly1305' and 'AES-GCM')](encrypt-decrypt-payloads-chacha20-poly1305-aes.md) · [Envelope key encapsulation](envelope-key-encapsulation.md).
## Fallback strategies

{# {{ BASELINE_STATUS("tmp-webcrypto-modern-algos") }} #}
{{ BASELINE_STATUS("web-cryptography") }}
{{ BASELINE_STATUS("web-cryptography", "api.SubtleCrypto.deriveBits.x25519") }}

If your Baseline target does not yet support `SubtleCrypto.supports()`, `encapsulateKey()`, or `'ChaCha20-Poly1305'`, detect support using the **static** `SubtleCrypto.supports()` method and fall back to ephemeral-static Diffie-Hellman key agreement (`'X25519'` + `'HKDF'` + `'AES-GCM'`, or `'ECDH'` with `'P-256'` when targeting browsers prior to `'X25519'` support):

- **Call `SubtleCrypto.supports()` on the `SubtleCrypto` constructor, not on `crypto.subtle`**: `globalThis.SubtleCrypto?.supports?.('encapsulateKey', 'MLKEM768-X25519', 'ChaCha20-Poly1305')` is a synchronous static method returning a boolean (`crypto.subtle.supports` is `undefined`). Note that `SubtleCrypto.supports()` validates operation-specific parameters: bare algorithm strings work for `'encapsulateKey'`, `'decapsulateKey'`, `'generateKey'`, `'importKey'`, `'exportKey'`, and `'getPublicKey'`, whereas probing `'encrypt'` or `'decrypt'` directly requires an `iv` (for example, `SubtleCrypto.supports('encrypt', { name: 'ChaCha20-Poly1305', iv: new Uint8Array(12) })`).
- **Key format in the fallback (`'raw'`)**: While browsers that support Modern WebCrypto also accept `'raw-public'` on `'X25519'` and `'ECDH'`, use `'raw'` in fallback paths targeting older browsers.
- **Classical fallback (`'X25519'` + `'HKDF'` + `'AES-GCM'`)**: When `SubtleCrypto.supports()` is unavailable or returns `false`, generate an ephemeral `'X25519'` key pair for the sender, export the ephemeral public key as the capsule bytes, derive 256 bits via `deriveBits({ name: 'X25519', public: peerPublicKey }, privateKey, 256)`, and pass those bits through `'HKDF'` (`'SHA-256'`) to derive a 256-bit `'AES-GCM'` key.

```javascript
const KEM_PUBLIC_KEY_ALGORITHMS = {
  1184: 'ML-KEM-768',
  1216: 'MLKEM768-X25519',
  1568: 'ML-KEM-1024',
};

export function supportsPostQuantumEnvelope() {
  return (
    typeof globalThis.SubtleCrypto?.supports === 'function' &&
    SubtleCrypto.supports('encapsulateKey', 'MLKEM768-X25519', 'ChaCha20-Poly1305')
  );
}

export async function generateRecipientKeys() {
  if (supportsPostQuantumEnvelope()) {
    const keyPair = await crypto.subtle.generateKey(
      'MLKEM768-X25519',
      false,
      ['encapsulateKey', 'decapsulateKey'],
    );
    const publicKeyBytes = new Uint8Array(
      await crypto.subtle.exportKey('raw-public', keyPair.publicKey),
    );
    return { suite: 'MLKEM768-X25519+ChaCha20-Poly1305', keyPair, publicKeyBytes };
  }

  // Classical fallback: X25519 key agreement + HKDF + AES-GCM
  const keyPair = await crypto.subtle.generateKey('X25519', false, ['deriveBits']);
  const publicKeyBytes = new Uint8Array(
    await crypto.subtle.exportKey('raw', keyPair.publicKey),
  );
  return { suite: 'X25519+HKDF+AES-GCM', keyPair, publicKeyBytes };
}

async function deriveFallbackAesKey(privateKey, peerPublicKey, infoBytes = new Uint8Array(0)) {
  const sharedSecret = await crypto.subtle.deriveBits(
    { name: 'X25519', public: peerPublicKey },
    privateKey,
    256,
  );
  const hkdfKey = await crypto.subtle.importKey('raw', sharedSecret, 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(32),
      info: infoBytes,
    },
    hkdfKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/client-side-encryption/guide.md#L185-L252). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
