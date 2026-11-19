```yaml
---
name: client-side-encryption
description: Establish shared secrets using public-key encapsulation or key agreement—including hybrid and post-quantum protection—and encrypt sensitive data in the browser with authenticated encryption.
web-feature-ids:
  - tmp-webcrypto-modern-algos
  - web-cryptography
---
```

# Encrypt data client-side with WebCrypto

Use the Web Cryptography API (`crypto.subtle`) to establish shared secrets over untrusted networks using quantum-resistant Key Encapsulation Mechanisms (KEMs) or classical key agreement, and encrypt sensitive data in the browser with Authenticated Encryption with Associated Data (AEAD). For signing and verifying messages or artifacts without encrypting them, see {{ GUIDE_REF("digital-signatures") }}.

An end-to-end envelope encryption flow splits into two phases:

- **One-time recipient setup (Steps 1–2)**: The recipient generates a key pair, persists the `CryptoKeyPair` in IndexedDB for future sessions, and exports the public key (`'raw-public'`) to share with senders.
- **Per-message encryption (Steps 3–4)**: For each payload, the sender imports the recipient's public key, calls `encapsulateKey()` to generate a fresh one-time shared key and ciphertext capsule, encrypts the payload with a fresh 12-byte IV, and sends `{ capsule, iv, ciphertext }` to the recipient.

## 1. Choose a KEM algorithm and generate a recipient key pair

Unlike Diffie-Hellman key agreement (`deriveKey()`), where both parties combine their keys, a Key Encapsulation Mechanism (KEM) uses the recipient's public key to generate both a random shared secret and a ciphertext capsule in a single `encapsulateKey()` call. The recipient recovers the same shared key from the ciphertext capsule using `decapsulateKey()`.

Use **`'MLKEM768-X25519'`** by default: it combines post-quantum ML-KEM (standardized in NIST FIPS 203) with classical `'X25519'` so the shared secret remains secure as long as either algorithm holds. Choose standalone `'ML-KEM-768'` when a policy requires pure FIPS 203 output without a hybrid component, or `'ML-KEM-1024'` when a policy requires NIST Category 5 (CNSA 2.0) compliance.

| Algorithm name | Security level & use case | Public key (`'raw-public'`) | Private seed (`'raw-seed'`) | Ciphertext size |
|---|---|---|---|---|
| **`'MLKEM768-X25519'`** | **Hybrid post-quantum (`'ML-KEM-768'`) + classical (`'X25519'`); recommended default** | 1216 bytes | 32 bytes | 1120 bytes |
| `'ML-KEM-768'` | NIST Category 3 (~192-bit security); standalone post-quantum KEM | 1184 bytes | 64 bytes | 1088 bytes |
| `'ML-KEM-1024'` | NIST Category 5 (~256-bit security); highest security margin | 1568 bytes | 64 bytes | 1568 bytes |

- Pass `'MLKEM768-X25519'`, `'ML-KEM-768'`, or `'ML-KEM-1024'` as the algorithm name (aliases such as `'X-Wing'` or `'X25519MLKEM768'`, as well as `'ML-KEM-512'`, throw `NotSupportedError`).
- Pass `extractable: false` and `['encapsulateKey', 'decapsulateKey']` (or `['encapsulateBits', 'decapsulateBits']`) when generating a KEM key pair. Non-extractable `CryptoKey` and `CryptoKeyPair` objects can be persisted across sessions directly in IndexedDB via structured cloning (`objectStore.put(recipientKeyPair, 'recipient-kem-key')`) without ever exporting the private key bytes:

```javascript
const recipientKeyPair = await crypto.subtle.generateKey(
  'MLKEM768-X25519',
  false,
  ['encapsulateKey', 'decapsulateKey'],
);
```

## 2. Export and import keys

Modern WebCrypto algorithms (`'MLKEM768-X25519'`, `'ML-KEM-768'`, `'ML-KEM-1024'`, and `'ChaCha20-Poly1305'`) **reject the legacy `'raw'` format** in `importKey()` and `exportKey()` with a `NotSupportedError`. Always specify the explicit key format:

- **`'raw-public'`**: Public key bytes (`1216`, `1184`, or `1568` bytes). Pass `['encapsulateKey']` (or `['encapsulateBits']`) when importing a KEM public key.
- **`'raw-seed'`**: Private key seed bytes (`32` bytes for `'MLKEM768-X25519'`; `64` bytes for `'ML-KEM-768'` and `'ML-KEM-1024'`). Pass `['decapsulateKey']` (or `['decapsulateBits']`) when importing a KEM private key (passing `['encapsulateKey', 'decapsulateKey']` to `importKey()` or `getPublicKey()` throws `SyntaxError`). Both `'raw'` and `'raw-private'` throw `NotSupportedError` on KEM private keys. Note that `'MLKEM768-X25519'` only supports `'raw-public'`, `'raw-seed'`, and `'jwk'`—it does **not** support `'spki'` or `'pkcs8'`.
- **`'raw-secret'`**: Symmetric secret key bytes (`'ChaCha20-Poly1305'`, and accepted on `'AES-GCM'` and `'HKDF'`).

Export the recipient's public key with `'raw-public'` so the public key bytes can be serialized (for example, as Base64 via `new Uint8Array(recipientPublicKeyBytes).toBase64()` or hex) and shared with senders:

```javascript
// Export the recipient's public key bytes
const recipientPublicKeyBytes = await crypto.subtle.exportKey(
  'raw-public',
  recipientKeyPair.publicKey,
);

// Import the recipient's public key on the sender (usage must be ['encapsulateKey'])
const importedPublicKey = await crypto.subtle.importKey(
  'raw-public',
  recipientPublicKeyBytes,
  'MLKEM768-X25519',
  true,
  ['encapsulateKey'],
);
```

If you only hold a private `CryptoKey` (even with `extractable: false`) and need its corresponding public `CryptoKey`, call `crypto.subtle.getPublicKey()`:

```javascript
const publicKey = await crypto.subtle.getPublicKey(
  recipientKeyPair.privateKey,
  ['encapsulateKey'],
);
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/client-side-encryption/guide.md#L1-L76). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
