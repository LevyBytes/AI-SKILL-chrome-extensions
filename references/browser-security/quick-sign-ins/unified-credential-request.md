[Complete example](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/quick-sign-ins/guide.md#L86-L186). Related sections: [Quick sign ins](overview.md) · [Sign in action and focus](sign-in-action-and-focus.md).
### Unified credential request

1. **Request both passkeys and passwords**: Decode the server options using `PublicKeyCredential.parseRequestOptionsFromJSON()` and call `navigator.credentials.get()` inside a user-initiated click handler with `password: true`, `publicKey`, and `uiMode: 'immediate'` (without passing `signal`).
2. **Branch verification by `cred.type`**:
    - If `cred.type === 'public-key'`, serialize the assertion with `cred.toJSON()` and POST it to your WebAuthn verification endpoint. When the server responds with HTTP `404`, call `PublicKeyCredential.signalUnknownCredential({ rpId: publicKey.rpId, credentialId: encoded.id })`. Always use `publicKey.rpId` from the server's request options—**DO NOT** derive or fall back to `window.location.hostname` on the client, as the server's configured RP ID may be a registrable parent domain (such as `example.com` on `shop.example.com`) or use Related Origin Requests.
    - If `cred.type === 'password'`, POST `{ username: cred.id, password: cred.password }` to your password verification endpoint.
3. **Handle `NotAllowedError` when no local credentials exist**: Catch `NotAllowedError` (thrown immediately when no local passkeys or saved passwords exist on the device, or when the user dismisses the chooser) and transition to your standard sign-in flow (such as opening an inline sign-in dialog or navigating to `/signin` with a return URL). When revealing an inline fallback sign-in form or dialog in place, move focus to its first interactive control and announce the state change via a polite live region (`role="status"`).
4. **Restore focus and announce in-place sign-in completion**: When in-place authentication or fallback form submission hides the sign-in trigger or inline form, restore focus to the originating action control (or to a surviving authenticated control in the header) so keyboard focus does not drop to `document.body`, and announce the authenticated state in a status live region (`role="status"`).

```javascript
let isAuthenticating = false;

async function authenticateWithImmediateUi() {
  const optionsResponse = await fetch('/api/login/options', { method: 'POST' });
  if (!optionsResponse.ok) {
    throw new Error('Failed to fetch authentication options');
  }
  const optionsJSON = await optionsResponse.json();
  const publicKey = PublicKeyCredential.parseRequestOptionsFromJSON(optionsJSON);

  // MANDATORY: Request both password and publicKey with uiMode: 'immediate' and NO signal parameter
  const cred = await navigator.credentials.get({
    password: true,
    publicKey,
    uiMode: 'immediate',
  });

  if (!cred) {
    throw new DOMException('No credential returned', 'NotAllowedError');
  }

  if (cred.type === 'public-key') {
    const encoded = cred.toJSON();
    const verifyResponse = await fetch('/api/login/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(encoded),
    });

    if (verifyResponse.status === 404) {
      if (PublicKeyCredential.signalUnknownCredential) {
        await PublicKeyCredential.signalUnknownCredential({
          rpId: publicKey.rpId, // Always use the server-provided rpId; DO NOT use window.location.hostname
          credentialId: encoded.id, // Base64URL-encoded credential ID string
        });
      }
      throw new Error('Passkey credential is no longer recognized by the server');
    }

    if (!verifyResponse.ok) {
      throw new Error('Passkey verification failed');
    }
    return await verifyResponse.json();
  }

  if (cred.type === 'password') {
    const verifyResponse = await fetch('/api/login/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: cred.id,
        password: cred.password,
      }),
    });

    if (!verifyResponse.ok) {
      throw new Error('Password verification failed');
    }
    return await verifyResponse.json();
  }

  throw new Error(`Unsupported credential type: ${cred.type}`);
}

```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/quick-sign-ins/guide.md#L77-L150). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
