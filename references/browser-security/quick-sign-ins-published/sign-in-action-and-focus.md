[Complete example](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/security/quick-sign-ins.md#L76-L176). Related sections: [Unified credential request](unified-credential-request.md) · [Easy JSON serialization fallback](easy-json-serialization-fallback.md).
```javascript
// Example: Intercepting an inline micro-action (Favorite button) or Header Sign-in click
const favoriteButton = document.getElementById('favorite-btn');

favoriteButton.addEventListener('click', async (event) => {
  event.preventDefault();
  if (isAuthenticating) return;

  // If already signed in, toggle the micro-action state immediately
  if (document.body.dataset.signedIn === 'true') {
    const nextPressed = favoriteButton.getAttribute('aria-pressed') !== 'true';
    favoriteButton.setAttribute('aria-pressed', String(nextPressed));
    return;
  }

  isAuthenticating = true;
  try {
    const user = await authenticateWithImmediateUi();
    // Complete the user's intended action immediately, restore focus so hiding
    // sign-in UI does not drop focus to document.body, and announce status
    document.body.dataset.signedIn = 'true';
    favoriteButton.setAttribute('aria-pressed', 'true');
    updateHeaderUserState(user);
    favoriteButton.focus();
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      // No local credentials available or user dismissed dialog:
      // reveal fallback sign-in UI (moving focus to its first input) or redirect with return URL
      showFallbackSignInUi({ returnAction: 'favorite', returnFocusEl: favoriteButton });
      return;
    }
    console.error('Authentication error:', err);
  } finally {
    isAuthenticating = false;
  }
});
```

## Fallback strategies

### Immediate UI mode fallback

- **Progressive enhancement experience**: Treat `uiMode: 'immediate'` as a progressive enhancement. Do not infer support from a browser's name or version; the only reliable support signal is the `capabilities.immediateGet` runtime check via `PublicKeyCredential.getClientCapabilities()`. **MANDATORY**: Always check `capabilities.immediateGet` before calling `navigator.credentials.get({ uiMode: 'immediate' })`—browsers that do not recognize `uiMode: 'immediate'` ignore the unknown dictionary key and open a blocking modal passkey and QR code dialog. When `capabilities.immediateGet` is falsy, or when `navigator.credentials.get()` rejects with `NotAllowedError`, fall back to your application's standard sign-in experience (such as opening an inline sign-in modal or navigating to the dedicated sign-in page with a return URL parameter), so users in unsupported browsers see your existing sign-in flow unchanged:

```javascript
async function isImmediateUiSupported() {
  if (!window.PublicKeyCredential || !PublicKeyCredential.getClientCapabilities) {
    return false;
  }
  try {
    const capabilities = await PublicKeyCredential.getClientCapabilities();
    return Boolean(capabilities?.immediateGet);
  } catch {
    return false;
  }
}

async function authenticateWithImmediateUi() {
  // MANDATORY: Check immediateGet support so unsupported browsers do not open a modal QR dialog
  const supported = await isImmediateUiSupported();
  if (!supported) {
    // Throw NotAllowedError so the caller's single catch path treats "unsupported" like "no local credentials"
    throw new DOMException('Immediate UI mode is not supported', 'NotAllowedError');
  }
  // Proceed with fetching options and calling navigator.credentials.get({ password: true, publicKey, uiMode: 'immediate' })
}
```

### Client capabilities detection fallback

Baseline status for the api.PublicKeyCredential.getClientCapabilities_static capability: Newly available. It's been Baseline since 2025-02-06.
Supported by: Chrome 133 (Feb 2025), Edge 133 (Feb 2025), Firefox 135 (Feb 2025), and Safari 17.4 (Mar 2024).

Always install `'webauthn-polyfills'` and import it in your client module so `PublicKeyCredential.getClientCapabilities()` is available whenever `PublicKeyCredential` is supported:

```javascript
import 'webauthn-polyfills';
```

### Password credentials fallback

Browser support for Password credentials: Limited availability.
Supported by: Chrome 60 (Jul 2017) and Edge 79 (Jan 2020).
Unsupported in: Firefox and Safari.

Passing `password: true` alongside `publicKey` in `navigator.credentials.get()` allows supporting browsers to include saved passwords from the browser's password manager in the unified immediate account chooser.

- **Fallback experience**: Browsers that do not support `PasswordCredential` ignore the `password: true` option or fall back via the `capabilities.immediateGet` feature check to the standard sign-in form, where `<input autocomplete="username webauthn">` and `<input type="password" autocomplete="current-password">` provide native password autofill.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/security/quick-sign-ins.md#L141-L228). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
