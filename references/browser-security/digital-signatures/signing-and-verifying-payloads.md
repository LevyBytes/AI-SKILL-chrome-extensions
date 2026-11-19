[Complete example](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/digital-signatures/guide.md#L140-L241). Related sections: [Fallback strategies](fallback-strategies.md).
```javascript
export async function signPayload(
  privateKey,
  payloadBytes,
  contextBytes = new Uint8Array(0),
) {
  if (privateKey.algorithm.name.startsWith('ML-DSA')) {
    const sig = await crypto.subtle.sign(
      { name: privateKey.algorithm.name, context: contextBytes },
      privateKey,
      payloadBytes,
    );
    return new Uint8Array(sig);
  }

  const framed = frameFallbackInput(payloadBytes, contextBytes);
  const sig = await crypto.subtle.sign('Ed25519', privateKey, framed);
  return new Uint8Array(sig);
}

export async function verifyPayload(
  publicKeyOrBytes,
  signatureBytes,
  payloadBytes,
  contextBytes = new Uint8Array(0),
) {
  const publicKey =
    publicKeyOrBytes instanceof CryptoKey
      ? publicKeyOrBytes
      : await (() => {
          const bytes =
            publicKeyOrBytes instanceof Uint8Array
              ? publicKeyOrBytes
              : new Uint8Array(publicKeyOrBytes);
          const mlDsaName = ML_DSA_PUBLIC_KEY_ALGORITHMS[bytes.byteLength];
          return mlDsaName
            ? crypto.subtle.importKey('raw-public', bytes, mlDsaName, true, ['verify'])
            : crypto.subtle.importKey('raw', bytes, 'Ed25519', true, ['verify']);
        })();

  if (publicKey.algorithm.name.startsWith('ML-DSA')) {
    return crypto.subtle.verify(
      { name: publicKey.algorithm.name, context: contextBytes },
      publicKey,
      signatureBytes,
      payloadBytes,
    );
  }

  const framed = frameFallbackInput(payloadBytes, contextBytes);
  return crypto.subtle.verify('Ed25519', publicKey, signatureBytes, framed);
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/digital-signatures/guide.md#L190-L241). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
