## Signal API Synchronization

The Signal API lets the application communicate credential states to password managers, keeping the user's synced vaults and your backend database in lockstep.

> [!IMPORTANT]
> Browsers strictly validate Base64URL encoding and string length (`length % 4 !== 1`, characters strictly `[A-Za-z0-9_-]`, no `=` padding) in native code. Passing arbitrary human-readable placeholder or mock IDs (such as `'passkey-1'`, `'cred:01'`, or unencoded strings like `'cred_yubikey_01'`) throws `TypeError: Invalid base64url string for allAcceptedCredentialIds` on page load. Always encode mock/test IDs as genuine unpadded Base64URL strings (for example, `'dGVzdC1jcmVkLTE'` or `Buffer.from('cred-1').toString('base64url')`) and validate format before invoking the Signal API.

*   **Use the Server-Provided `rpId` (DO NOT Use `window.location.hostname`)**:
    *   Always pass the `rpId` returned by your backend API (matching the `rp.id` used when registering passkeys). **DO NOT** derive `rpId` from `window.location.hostname` on the client: when credentials are registered to a registrable parent domain (for example, `example.com` while the settings page is served on `accounts.example.com`) or shared via Related Origin Requests (`/.well-known/webauthn`), `window.location.hostname` will not match the credential's RP ID, causing password manager synchronization to silently target the wrong RP ID or throw a `SecurityError`.
*   **Feature Detection & Parameter Encoding Rule**:
    *   Always feature-detect Signal API methods before invoking them (`if (PublicKeyCredential.signalAllAcceptedCredentials)` and `if (PublicKeyCredential.signalCurrentUserDetails)`).
    *   All `userId` and credential ID parameters passed to Signal API methods (`signalAllAcceptedCredentials`, `signalCurrentUserDetails`) MUST be **valid unpadded Base64URL-encoded strings**. Validate `userId` and `allAcceptedCredentialIds` before calling the API so malformed IDs are skipped safely rather than throwing on load.
*   **Initiating Page Load Sync**:
    *   The application MUST invoke `signalAllAcceptedCredentials()` automatically when the management page loads (for example, inside a `DOMContentLoaded` event listener, module initialization, or framework component mount hook such as `useEffect`).
*   **Management Updates Sync**:
    *   The application MUST invoke `signalAllAcceptedCredentials()` immediately within your delete credential click handler post-fetch.
    *   The application MUST invoke `signalCurrentUserDetails()` immediately within your user account rename (`name` or `displayName`) click handler post-fetch.
*   **Non-Fatal Error Handling (`console.warn`)**:

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/passkey-management/guide.md#L87-L104). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
