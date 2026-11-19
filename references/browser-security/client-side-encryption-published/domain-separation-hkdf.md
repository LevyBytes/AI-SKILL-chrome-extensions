### Domain separation with `'HKDF'`

To bind the shared key to a specific protocol context (`info` and `salt`) or derive multiple subkeys from a single encapsulation, pass `'HKDF'` as `sharedKeyAlgorithm` with `['deriveKey']` usage, then call `crypto.subtle.deriveKey()`:

```javascript
const { sharedKey: hkdfBaseKey, ciphertext } = await crypto.subtle.encapsulateKey(
  'MLKEM768-X25519',
  importedPublicKey,
  'HKDF',
  false,
  ['deriveKey'],
);

const aeadKey = await crypto.subtle.deriveKey(
  {
    name: 'HKDF',
    hash: 'SHA-256',
    salt: new Uint8Array(32),
    info: new TextEncoder().encode('envelope-v1'),
  },
  hkdfBaseKey,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt', 'decrypt'],
);
```

## 4. Encrypt and decrypt payloads (`'ChaCha20-Poly1305'` and `'AES-GCM'`)

Encrypt payload data with an AEAD algorithm (`'ChaCha20-Poly1305'` or `'AES-GCM'`) using a fresh, cryptographically random **12-byte (96-bit) initialization vector (`iv`)** for every encryption operation. Never reuse an `(iv, key)` pair. Choose `'ChaCha20-Poly1305'` for consistent constant-time performance across devices without dedicated AES hardware acceleration, or `'AES-GCM'` when interoperating with existing WebCrypto or FIPS 140 deployments.

- **`'ChaCha20-Poly1305'`**: Uses a fixed 256-bit (32-byte) key (`generateKey('ChaCha20-Poly1305', extractable, ['encrypt', 'decrypt'])` takes a string or `{ name: 'ChaCha20-Poly1305' }` with **no `length` property**). The `iv` must be exactly 12 bytes, and the 128-bit Poly1305 authentication tag is appended to the ciphertext.
- **`'AES-GCM'`**: Pass `{ name: 'AES-GCM', length: 256 }` when calling `generateKey()` or `deriveKey()`, and a 12-byte `iv` when calling `encrypt()` and `decrypt()`.
- **`additionalData` (AAD)**: Bind unencrypted metadata (such as a record ID, recipient ID, or protocol version) to the authentication tag via `additionalData` so tampering with either the ciphertext or the metadata causes `decrypt()` to reject with `OperationError`.

```javascript
/**
 * Encrypts UTF-8 text with an AEAD CryptoKey ('ChaCha20-Poly1305' or 'AES-GCM').
 * @param {CryptoKey} key
 * @param {string} plaintext
 * @param {Uint8Array} [additionalData]
 */
export async function encryptMessage(key, plaintext, additionalData = new Uint8Array(0)) {
  // Always generate a fresh 12-byte (96-bit) IV per message
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: key.algorithm.name,
      iv,
      additionalData,
    },
    key,
    encoded,
  );

  return { iv, ciphertext: new Uint8Array(ciphertextBuffer) };
}

/**
 * Decrypts and authenticates an AEAD payload. Throws OperationError if tampered.
 * @param {CryptoKey} key
 * @param {Uint8Array} iv
 * @param {Uint8Array} ciphertext
 * @param {Uint8Array} [additionalData]
 */
export async function decryptMessage(key, iv, ciphertext, additionalData = new Uint8Array(0)) {
  const plaintextBuffer = await crypto.subtle.decrypt(
    {
      name: key.algorithm.name,
      iv,
      additionalData,
    },
    key,
    ciphertext,
  );

  return new TextDecoder().decode(plaintextBuffer);
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/security/client-side-encryption.md#L95-L176). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
