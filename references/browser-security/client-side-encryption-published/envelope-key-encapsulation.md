[Complete example](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/security/client-side-encryption.md#L191-L302). Related sections: [Fallback strategies](fallback-strategies.md).
```javascript
export async function encapsulateEnvelopeKey(
  recipientPublicKeyOrBytes,
  infoBytes = new Uint8Array(0),
) {
  const pubKey =
    recipientPublicKeyOrBytes instanceof CryptoKey
      ? recipientPublicKeyOrBytes
      : await (() => {
          const bytes =
            recipientPublicKeyOrBytes instanceof Uint8Array
              ? recipientPublicKeyOrBytes
              : new Uint8Array(recipientPublicKeyOrBytes);
          const kemName = KEM_PUBLIC_KEY_ALGORITHMS[bytes.byteLength];
          return kemName
            ? crypto.subtle.importKey('raw-public', bytes, kemName, true, ['encapsulateKey'])
            : crypto.subtle.importKey('raw', bytes, 'X25519', true, []);
        })();

  if (pubKey.algorithm.name !== 'X25519') {
    const { sharedKey, ciphertext } = await crypto.subtle.encapsulateKey(
      pubKey.algorithm.name,
      pubKey,
      'ChaCha20-Poly1305',
      false,
      ['encrypt', 'decrypt'],
    );
    return { sharedKey, capsuleBytes: new Uint8Array(ciphertext) };
  }

  // Classical fallback: generate ephemeral X25519 key pair and send ephemeral public key as capsule
  const ephemeral = await crypto.subtle.generateKey('X25519', false, ['deriveBits']);
  const capsuleBytes = new Uint8Array(await crypto.subtle.exportKey('raw', ephemeral.publicKey));
  const sharedKey = await deriveFallbackAesKey(ephemeral.privateKey, pubKey, infoBytes);
  return { sharedKey, capsuleBytes };
}

export async function decapsulateEnvelopeKey(
  recipientPrivateKey,
  capsuleBytes,
  infoBytes = new Uint8Array(0),
) {
  if (recipientPrivateKey.algorithm.name !== 'X25519') {
    return crypto.subtle.decapsulateKey(
      recipientPrivateKey.algorithm.name,
      recipientPrivateKey,
      capsuleBytes,
      'ChaCha20-Poly1305',
      false,
      ['encrypt', 'decrypt'],
    );
  }

  const ephemeralPubKey = await crypto.subtle.importKey('raw', capsuleBytes, 'X25519', true, []);
  return deriveFallbackAesKey(recipientPrivateKey, ephemeralPubKey, infoBytes);
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/security/client-side-encryption.md#L247-L302). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
