### Signal API Synchronization Fallback

Browser support for Web authentication signal methods: Limited availability.
Supported by: Chrome 132 (Jan 2025), Edge 132 (Jan 2025), and Safari 26 (Sep 2025).
Unsupported in: Firefox.

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


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/security/passkey-management.md#L276-L310). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
