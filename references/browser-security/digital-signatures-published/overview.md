# Sign and verify data with WebCrypto

Use the Web Cryptography API (`crypto.subtle`) to sign and verify messages, tokens, or artifacts in the browser using quantum-resistant (ML-DSA) or classical (`'Ed25519'`, `'ECDSA'`) asymmetric keys. Digital signatures guarantee data integrity and signer authenticity without requiring shared secret keys. For establishing shared secrets and encrypting confidential payloads, see `client-side-encryption` (via `npx -y modern-web-guidance@latest retrieve "client-side-encryption"`).

## 1. Choose an algorithm and generate a key pair

ML-DSA (Module-Lattice-Based Digital Signature Algorithm, standardized in NIST FIPS 204) provides post-quantum lattice-based digital signatures resistant to attacks by both classical and quantum computers.

Use **`'ML-DSA-65'`** by default for general-purpose signing. Choose `'ML-DSA-44'` when you need smaller public keys and signatures over bandwidth-constrained channels and 128-bit security is sufficient, or `'ML-DSA-87'` when a security policy requires NIST Category 5 (CNSA 2.0) compliance.

| Algorithm name | Security level & use case | Public key (`'raw-public'`) | Signature size |
|---|---|---|---|
| `'ML-DSA-44'` | NIST Category 2 (~128-bit security); smallest keys and signatures | 1312 bytes | 2420 bytes |
| **`'ML-DSA-65'`** | **NIST Category 3 (~192-bit security); recommended default** | 1952 bytes | 3309 bytes |
| `'ML-DSA-87'` | NIST Category 5 (~256-bit security); highest security margin | 2592 bytes | 4627 bytes |

- Pass `'ML-DSA-44'`, `'ML-DSA-65'`, or `'ML-DSA-87'` as the algorithm name (pre-standardization names such as `'Dilithium'` or `'CRYSTALS-Dilithium'` throw `NotSupportedError`).
- Neither ML-DSA nor `'Ed25519'` takes a `hash` parameter.
- Pass `['sign', 'verify']` when generating a key pair with `generateKey()`:

```javascript
const signerKeyPair = await crypto.subtle.generateKey(
  'ML-DSA-65',
  false,
  ['sign', 'verify'],
);
```

## 2. Export and import keys

`'ML-DSA-44'`, `'ML-DSA-65'`, and `'ML-DSA-87'` **reject the legacy `'raw'` format** in `importKey()` and `exportKey()` with a `NotSupportedError`. Always export or import keys using an explicit format:

- **`'raw-public'`**: Public key bytes (`1312`, `1952`, or `2592` bytes). Pass `['verify']` as the key usage when importing a public key.
- **`'raw-seed'`**: 32-byte private key seed for all three ML-DSA algorithms. Both `'raw'` and `'raw-private'` throw `NotSupportedError` on ML-DSA—store or transmit private keys using `'raw-seed'`, `'pkcs8'` (54 bytes), or `'jwk'` (`kty: 'AKP'`). Pass `['sign']` as the key usage when importing a private key (passing `['sign', 'verify']` to `importKey()` throws `SyntaxError`).
- **`'spki'`, `'pkcs8'`, and `'jwk'`**: Supported for all three ML-DSA algorithms.

Always export the verification public key with `'raw-public'` so the public key bytes can be serialized or shared with verifiers:

```javascript
// Export the public key bytes on the signer
const publicKeyBytes = await crypto.subtle.exportKey(
  'raw-public',
  signerKeyPair.publicKey,
);

// Import the public key bytes on the verifier (usage must be ['verify'] only)
const verifierPublicKey = await crypto.subtle.importKey(
  'raw-public',
  publicKeyBytes,
  'ML-DSA-65',
  true,
  ['verify'],
);
```

If you only hold a private signing `CryptoKey` (even with `extractable: false`) and need its corresponding public `CryptoKey`, call `crypto.subtle.getPublicKey()` with `['verify']`:

```javascript
const publicKey = await crypto.subtle.getPublicKey(
  signerKeyPair.privateKey,
  ['verify'],
);
```

## 3. Sign and verify payloads

Call `crypto.subtle.sign()` with the private key to produce a signature, and `crypto.subtle.verify()` with the public key to check it:

```javascript
const payloadBytes = new TextEncoder().encode(
  '{"artifact":"release-v2.4.0.tar.gz","sha256":"9f86d08..."}',
);

const signatureBuffer = await crypto.subtle.sign(
  'ML-DSA-65',
  signerKeyPair.privateKey,
  payloadBytes,
);

const isValid = await crypto.subtle.verify(
  'ML-DSA-65',
  verifierPublicKey,
  signatureBuffer,
  payloadBytes,
);
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/security/digital-signatures.md#L1-L87). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
