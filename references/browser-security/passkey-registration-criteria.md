# Expectations for Passkey Registration

*   The implementation MUST load a webauthn-polyfills library. 
*   The "Create Passkey" button is gated on PublicKeyCredential.getClientCapabilities and hidden when conditional UI or passkey is unsupported.
*   The client invokes browser native passkey creation prompt upon clicking the button trigger.
*   The client decodes server creation options via parseCreationOptionsFromJSON before invoking the authenticator.
*   The client submits the resulting attestation to the verification endpoint as JSON-encoded credential data containing the credential id.
*   If the verification fails with a bad status or throws a network exception, signalUnknownCredential is automatically triggered.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/passkey-registration/expectations.md#L1-L8). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
