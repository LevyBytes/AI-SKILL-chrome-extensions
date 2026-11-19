### Step 1: Parse the SD-JWT claims and validate the email address

After consuming the single-use `expectedNonce` from server-side session storage, decode the SD-JWT presentation (`EVT + KB-JWT`) and verify that:
- Both the issuer JWT (`jwt`) and Key Binding JWT (`kbJwt`) are present, along with the issuer claim (`iss`).
- `evtPayload.email_verified === true`.
- `evtPayload.email` matches the submitted form email using a **case-insensitive comparison** (`toLowerCase()`).

```javascript
import { createHash } from 'node:crypto';
import { decodeSdJwtSync } from '@sd-jwt/core';

const hasher = (data, alg) =>
  createHash(alg === 'sha-256' ? 'sha256' : alg).update(data).digest();

const decoded = decodeSdJwtSync(rawToken, hasher);
const evtPayload = decoded.jwt.payload;
const iss = evtPayload.iss;

if (!expectedNonce || !decoded.kbJwt || !iss || evtPayload.email_verified !== true) {
  throw new Error('Missing nonce, KB-JWT, issuer, or email_verified !== true.');
}
// MANDATORY: Compare email addresses case-insensitively
if (evtPayload.email?.toLowerCase() !== submittedEmail.toLowerCase()) {
  throw new Error('Submitted email does not match the EVT email claim.');
}
```

### Step 2: Validate DNS TXT delegation and load the issuer JWKS

Before making any network request to `iss`, verify that the submitted email's domain delegates authority to that exact issuer via a `_email-verification.<domain>` DNS `TXT` record (`iss=<issuer-host>` -> `https://<issuer-host>` with no port, path, or trailing slash). Once DNS delegation matches `iss` byte-for-byte, fetch `${iss}/.well-known/email-verification` over HTTPS, confirm that `metadata.issuer === iss`, and load the issuer's JSON Web Key Set (JWKS).

> **Note on `kid` handling:** Some major email providers (such as Gmail) omit `kid` from the EVT header. When `kid` is absent and the JWKS contains multiple keys, `jose` throws `ERR_JWKS_MULTIPLE_MATCHING_KEYS` (an `AsyncIterable` of matching `CryptoKey`s)—iterate `for await (const publicKey of err)` to trial-verify each key, as shown in Step 3.

```javascript
import dns from 'node:dns/promises';
import { createRemoteJWKSet } from 'jose';

const domain = submittedEmail.split('@')[1];
const txtRecords = (await dns.resolveTxt(`_email-verification.${domain}`)).map((r) => r.join(''));
if (!txtRecords.some((txt) => txt.startsWith('iss=') && `https://${txt.slice(4).trim()}` === iss)) {
  throw new Error(`Issuer "${iss}" is not delegated via DNS for "${domain}".`);
}

const discoveryUrl = new URL('/.well-known/email-verification', iss);
if (discoveryUrl.protocol !== 'https:') throw new Error('Issuer must use HTTPS.');
const metadata = await (await fetch(discoveryUrl)).json();
if (metadata.issuer !== iss || !metadata.jwks_uri?.startsWith('https://')) {
  throw new Error('Invalid issuer metadata or non-HTTPS jwks_uri.');
}
const issuerJwks = createRemoteJWKSet(new URL(metadata.jwks_uri));
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/security/verify-email-ownership.md#L86-L137). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
