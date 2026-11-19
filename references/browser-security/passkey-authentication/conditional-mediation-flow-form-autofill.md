### Conditional Mediation Flow (Form Autofill)

Activate form autofill suggestions on page load to offer passkey authentication natively when users focus on sign-in fields:

1.  **Feature detect**: Call `PublicKeyCredential.getClientCapabilities()` on page load and **skip signing in with passkey** if `conditionalGet` is not available.
2.  **Decode options**: Decode fetched credential JSON object with `PublicKeyCredential.parseRequestOptionsFromJSON()`.
3.  **Invoke Conditional Get**: Call `navigator.credentials.get()` with `mediation: "conditional"` and pass an `AbortController` signal. This registers autofill silently without rendering a passkey dialog.
4.  **Try/Catch Exception Segregation**: Wrap `navigator.credentials.get` call in try/catch block:
    - `NotAllowedError`: The user cancelled or timed out the passkey login prompt.
    - `AbortError`: The authentication request was cancelled programmatically.
5.  **Call Signal API**: Wrap server verification `fetch()` call in a try/catch block:
    - Show an error message for the user to understand what went wrong.
    - Call `signalUnknownCredential()` ONLY when the server explicitly responds with HTTP status `404` (Credential not found) and the user is unauthenticated.
    - Always pass `rpId: publicKey.rpId` from the server's request options. **DO NOT** derive `rpId` from `window.location.hostname` on the client, as the server's configured RP ID may be a registrable parent domain (such as `example.com` on `login.example.com`) or use Related Origin Requests.
    - The `credentialId` parameter passed to `signalUnknownCredential()` MUST strictly be the Base64URL-encoded credential ID string (e.g., `encoded.id`), NOT the raw ArrayBuffer object `credential.rawId`.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/passkey-authentication/guide.md#L83-L97). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
