# Expectations for Passkey Authentication

*   The implementation MUST load a webauthn-polyfills library. 
*   The HTML form annotates the username input element with autocomplete="username webauthn".
*   The client feature detects capabilities using PublicKeyCredential.getClientCapabilities and skips initializing Conditional UI when conditionalGet is not available.
*   The client decodes fetched credential options via parseRequestOptionsFromJSON before invoking navigator.credentials.get.
*   The application registers Conditional UI suggestions automatically on load with mediation="conditional".
*   The explicit passkey sign-in button click aborts pending Conditional UI autofill suggestions prior to prompting users.
*   If the server verification endpoint returns an explicit HTTP 404 status, PublicKeyCredential.signalUnknownCredential is invoked passing the Base64URL credential ID.
*   A successful credential verification updates the UI status to indicate successful authentication and session establishment.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/passkey-authentication/expectations.md#L1-L10). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
