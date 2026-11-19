## 3. Encapsulate and decapsulate a shared key

`encapsulateKey()` and `decapsulateKey()` import the 32-byte (256-bit) KEM shared secret into a `CryptoKey` using the algorithm specified in `sharedKeyAlgorithm` (with `'raw-secret'` format). Pass `'ChaCha20-Poly1305'` or `'AES-GCM'` directly to produce an AEAD encryption key:

```javascript
// Sender encapsulates a 256-bit AEAD key and produces a ciphertext capsule
const { sharedKey: senderKey, ciphertext: encapsulatedCiphertext } =
  await crypto.subtle.encapsulateKey(
    'MLKEM768-X25519',
    importedPublicKey,
    'ChaCha20-Poly1305', // Or 'AES-GCM'
    false,
    ['encrypt', 'decrypt'],
  );

// Recipient decapsulates the ciphertext capsule to recover the identical AEAD key
const recipientKey = await crypto.subtle.decapsulateKey(
  'MLKEM768-X25519',
  recipientKeyPair.privateKey,
  encapsulatedCiphertext,
  'ChaCha20-Poly1305',
  false,
  ['encrypt', 'decrypt'],
);
```

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


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/client-side-encryption/guide.md#L77-L129). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
