# Expectations for Passkey Management

*   The application fetches registered credentials from the credential endpoint on load.
*   The application automatically invokes signalAllAcceptedCredentials on load (for example, via DOMContentLoaded or component mount) to sync accepted credentials list strings with the password manager.
*   The application updates passkey providers by immediately calling signalAllAcceptedCredentials within the delete trigger handler upon successful deletions.
*   The application invokes signalCurrentUserDetails within the user profile rename handler upon successful username or display name rename.
*   Each credential row resolved against the AAGUID registry renders info such as the provider icon, name and a human-readable last-used timestamp.
*   The "Create Passkey" entry-point button is gated on PublicKeyCredential.getClientCapabilities and hidden when passkey is unsupported.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/passkey-management/expectations.md#L1-L9). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
