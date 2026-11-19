### Step 3: Verify the EVT signature and Key Binding JWT (`KB-JWT`)

Finally, verify both signatures and the cryptographic binding between the two tokens using the explicit asymmetric algorithm allowlist (`['Ed25519', 'EdDSA', 'ES256']`):
1. **EVT signature (`verifier`):** Verify against `issuerJwks` (catching `ERR_JWKS_MULTIPLE_MATCHING_KEYS` to iterate candidate keys when `kid` is omitted), enforcing `iss` and a tight freshness window (`maxTokenAge: '5m'`, `clockTolerance: '1m'`).
2. **Holder binding (`kbVerifier` and `sdJwt.verify` options):** Extract the browser's ephemeral public key from `evtPayload.cnf.jwk`, confirm both `cnf.jwk.alg` and `decoded.kbJwt.header.alg` are in `ALLOWED_ALGS` and match (treating `'Ed25519'` and `'EdDSA'` as equivalent while Origin Trial implementations transition to RFC 9864 `'Ed25519'`), and verify the `KB-JWT` signature with `typ: 'kb+jwt'`. Pass `keyBindingNonce: expectedNonce`, `expectedKeyBindingAudience: expectedAudience`, and `keyBindingMaxAgeSeconds: 300` to `sdJwt.verify()`—`@sd-jwt/core` only invokes `kbVerifier` and validates `nonce`, `aud`, `iat`, and `sd_hash` when `keyBindingNonce` is supplied.

```javascript
import { SDJwtInstance } from '@sd-jwt/core';
import { importJWK, jwtVerify } from 'jose';

// IETF draft-hardt-email-verification-02 (§3.3, §5.1.1) specifies RFC 9864 'Ed25519' and 'ES256'.
// TODO: Remove 'EdDSA' once live issuers (e.g. Gmail) and Chrome Origin Trial builds finish
// transitioning from 'EdDSA' (with crv: 'Ed25519') to 'Ed25519'.
const ALLOWED_ALGS = ['Ed25519', 'EdDSA', 'ES256'];
const normalizeAlg = (alg) => (alg === 'Ed25519' ? 'EdDSA' : alg);
const evtOptions = {
  typ: 'ev+sd-jwt',
  issuer: iss,
  algorithms: ALLOWED_ALGS,
  maxTokenAge: '5m',
  clockTolerance: '1m',
};

const sdJwt = new SDJwtInstance({
  hasher,
  verifier: async (data, sig) => {
    const compactEvt = `${data}.${sig}`;
    try {
      await jwtVerify(compactEvt, issuerJwks, evtOptions);
    } catch (err) {
      // When `kid` is omitted (e.g. Gmail) and multiple keys match in the JWKS,
      // jose throws JWKSMultipleMatchingKeys, which yields each matching CryptoKey.
      if (err?.code !== 'ERR_JWKS_MULTIPLE_MATCHING_KEYS') throw err;
      let matched = false;
      for await (const publicKey of err) {
        try {
          await jwtVerify(compactEvt, publicKey, evtOptions);
          matched = true;
          break;
        } catch {}
      }
      if (!matched) throw err;
    }
    return true;
  },
  kbVerifier: async (data, sig) => {
    const holderJwk = evtPayload.cnf?.jwk;
    const holderAlg = holderJwk?.alg;
    const kbAlg = decoded.kbJwt.header.alg;
    if (
      !holderAlg ||
      !kbAlg ||
      !ALLOWED_ALGS.includes(holderAlg) ||
      !ALLOWED_ALGS.includes(kbAlg) ||
      normalizeAlg(kbAlg) !== normalizeAlg(holderAlg)
    ) {
      throw new Error('Missing, disallowed, or mismatched KB-JWT algorithm.');
    }
    const holderKey = await importJWK(holderJwk, kbAlg);
    await jwtVerify(`${data}.${sig}`, holderKey, {
      typ: 'kb+jwt',
      audience: expectedAudience,
      algorithms: [kbAlg],
      maxTokenAge: '5m',
      clockTolerance: '1m',
    });
    return true;
  },
});

const verified = await sdJwt.verify(rawToken, {
  requiredClaimKeys: ['email', 'email_verified'],
  keyBindingNonce: expectedNonce,
  expectedKeyBindingAudience: expectedAudience,
  keyBindingMaxAgeSeconds: 300,
  skewSeconds: 60,
});
```

## Best practices

- **DO** perform all token verification strictly on the server. **DO NOT** validate tokens in client-side JavaScript or trust any client-side verification state—client-side checks can be trivially bypassed or forged and provide zero trust guarantee to the relying party.
- **DO** use established SD-JWT and JOSE/JWT libraries for your backend platform (for example, `@sd-jwt/core` and `jose` in Node.js) to parse and validate the `EVT~KB-JWT` presentation, and pass `keyBindingNonce` to `sdJwt.verify()` so Key Binding verification cannot be bypassed. **DO NOT** hand-roll custom JWT, SD-JWT, or `sd_hash` parsing and signature verification routines.
- **DO** generate a fresh cryptographic `nonce` (at least 128 bits, such as `randomBytes(32).toString('base64url')`) on the server for each form render, store it in **server-side session state** (not directly in a client cookie), and serve the form page with `Cache-Control: no-store`.
- **DO** atomically read and delete the expected `nonce` from server-side session storage immediately when the `POST` request arrives so an intercepted token cannot be replayed.
- **DO** perform a **case-insensitive comparison** between `evtPayload.email` and the submitted form email address (`email.toLowerCase()`), while preserving the submitted email string.
- **DO** trial-verify all keys in the issuer's JWKS when `kid` is absent from the EVT header (providers such as Gmail omit `kid`).
- **DO** verify DNS delegation (`_email-verification.<domain>`) before trusting any `iss` claim in an EVT, and confirm `metadata.issuer === iss` in the `.well-known/email-verification` response.
- **DO NOT** treat email ownership verification as proof of inbox deliverability. EVP proves that the user controls the email account with the authoritative provider; still send transactional welcome emails and handle bounces normally.
- **DO NOT** block account creation or sign-in when `token` is empty or when verification fails—always degrade gracefully to your standard email OTP or magic link flow.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/security/verify-email-ownership.md#L138-L228). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
