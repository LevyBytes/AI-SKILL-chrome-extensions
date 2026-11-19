# Expectations for Passkey Conditional Create

*   The implementation MUST load a webauthn-polyfills library. 
*   The application feature-detects capability support checking PublicKeyCredential.getClientCapabilities before starting enrollment.
*   The client triggers background passkey creation method passing mediation="conditional".
*   Common WebAuthn exceptions like NotAllowedError are caught and swallowed silently without displaying error messages to the user.
*   If server verification of the credential fails, PublicKeyCredential.signalUnknownCredential is invoked.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/passkey-conditional-create/expectations.md#L1-L7). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
