### Signal API Synchronization Fallback

{{ BASELINE_STATUS("webauthn-signals") }}

The WebAuthn Signal API (`webauthn-signals`) is a progressive enhancement that synchronizes server-side credential deletions and account profile updates with the user's password manager. Because synchronization communicates directly with the browser or OS passkey provider, no polyfill is available if your Baseline target does not support `webauthn-signals`. Gate calls behind static feature detection on `PublicKeyCredential` so unsupported browsers skip background synchronization safely while server-side passkey listing, renaming, deletion, and user profile updates continue to work normally without throwing browser exceptions:

```javascript
if (window.PublicKeyCredential && PublicKeyCredential.signalAllAcceptedCredentials) {
  try {
    await PublicKeyCredential.signalAllAcceptedCredentials({
      rpId, // Server-provided RP ID (never window.location.hostname)
      userId, // Valid unpadded Base64URL user ID
      allAcceptedCredentialIds: credentialIds, // Valid unpadded Base64URL credential IDs
    });
  } catch (e) {
    console.warn('SignalAllAcceptedCredentials sync warning:', e);
  }
}

if (window.PublicKeyCredential && PublicKeyCredential.signalCurrentUserDetails) {
  try {
    await PublicKeyCredential.signalCurrentUserDetails({
      rpId, // Server-provided RP ID (never window.location.hostname)
      userId, // Valid unpadded Base64URL user ID
      name: updatedName,
      displayName: updatedDisplayName,
    });
  } catch (e) {
    console.warn('SignalCurrentUserDetails sync warning:', e);
  }
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/passkey-management/guide.md#L283-L315). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
