```yaml
---
name: quick-sign-ins
description: Authenticate returning users in place with their saved passkeys or passwords before navigating to a sign-in page or interrupting their workflow.
web-feature-ids:
  - webauthn
  - password-credentials
  - credential-management
  - webauthn-signals
---
```

# Quick sign-ins with immediate UI mode

Navigating an unauthenticated user to a dedicated sign-in page when they click a "Sign in" link, start checkout, save an item to favorites, or reach an article paywall causes context loss and increases user drop-off. Immediate UI mode (`uiMode: 'immediate'` in `navigator.credentials.get()`) enables contextual quick sign-ins by presenting a unified browser account chooser immediately when local passkeys (`publicKey`) or saved passwords (`password: true`) exist on the device.

Unlike standard modal WebAuthn prompts—which always display browser UI and fall back to cross-device QR codes or external security keys—Immediate UI mode fails fast with a `NotAllowedError` if no eligible credentials are locally available on the device. This lets your application authenticate returning users in place with a single tap while seamlessly transitioning users without local credentials to your standard sign-in page, guest checkout, or inline login form.

## Recommended UX patterns and anti-patterns

Trigger Immediate UI mode inside a user-initiated event handler (requiring transient user activation) at moments of clear user intent **right before** navigating away from the current page. If immediate authentication succeeds, complete the user's intent immediately (whether by updating the current page in place or proceeding directly to their authenticated destination). If it fails with `NotAllowedError`, show a sign-in or registration flow with a path to complete the user's intent on completion.

Potential use cases:

- **Header sign-in link or button interception**: Intercept a click on a global "Sign in" link (`event.preventDefault()`) to authenticate returning users immediately, or continue navigating to the dedicated sign-in page on `NotAllowedError`.
- **Dynamic sign-in before checkout**: Authenticate returning shoppers with a single tap when they click "Proceed to checkout" so they land directly on the shipping and payment step, or transition to the standard sign-in or guest checkout screen on fallback.
- **Inline sign-in for micro-actions (Favorite, Like, Bookmark, Save)**: Authenticate in place when a signed-out user clicks a micro-action button and immediately complete the action (for example, toggling `aria-pressed="true"`), or open a fallback login modal or sign-in page with a return URL parameter.
- **In-article soft paywalls**: Authenticate readers in place when they click "Continue reading with your account" on a paywall banner, or expand an inline sign-in or registration form on fallback.

Anti-patterns to avoid:

- **DO NOT use Immediate UI mode on a dedicated sign-in page**: Never attach `uiMode: 'immediate'` to the primary "Sign in" or "Sign in with a passkey" button on your final destination sign-in page. Users reach the dedicated sign-in page specifically when they have no local credentials on the current device, or when they intend to use a cross-device passkey (scanning a QR code with a phone) or an external hardware security key. Because `uiMode: 'immediate'` suppresses cross-device QR code and security key options and immediately throws `NotAllowedError` when no local credentials exist, using it on a dedicated sign-in page traps the user in a dead end where clicking the button does nothing. On a dedicated sign-in page, use Conditional UI (`mediation: 'conditional'` with `autocomplete="username webauthn"`) on form inputs paired with a standard modal `navigator.credentials.get({ publicKey })` button (see {{ GUIDE_REF("passkey-authentication") }}).
- **DO NOT use Immediate UI mode for step-up reauthentication**: Never use `uiMode: 'immediate'` to reauthenticate an already signed-in user before sensitive operations (such as changing a password, updating a shipping address, editing saved payment methods, or adding a new passkey). Reauthentication must restrict the prompt to the signed-in user's credentials via a non-empty `allowCredentials` list, which Immediate UI mode rejects with `NotAllowedError`, and omitting `allowCredentials` would let the user inadvertently select a different account than the one currently signed in. For step-up reauthentication, follow {{ GUIDE_REF("passkey-reauthentication") }}.

## Privacy and security constraints

Browsers enforce strict privacy and security rules when `uiMode: 'immediate'` is requested:

- **Transient user activation is required**: You MUST call `navigator.credentials.get({ uiMode: 'immediate' })` inside a user-initiated event handler (such as a `click` listener on a `<button>` or `<a>` element) to prevent silent credential probing. Never invoke it automatically on page load (`DOMContentLoaded`). Calling the API does not consume the transient activation.
- **Do not pass a non-empty `allowCredentials` list**: Do **NOT** populate `publicKey.allowCredentials` when `uiMode: 'immediate'` is specified. Browsers immediately reject any Immediate UI mode request with a non-empty `allowCredentials` list by throwing `NotAllowedError` so relying parties cannot probe for specific credential IDs to infer prior visits or track users across sessions.
- **Do not pass an `AbortSignal` (`signal`)**: Do **NOT** set the `signal` property on `navigator.credentials.get()` when `uiMode: 'immediate'` is specified, as browsers disallow programmatic dismissal of the immediate login dialog. If your page also runs a background Conditional UI (`mediation: 'conditional'`) request, call `abort()` on that Conditional UI `AbortController` before invoking Immediate UI mode, and omit `signal` from the immediate request itself.
- **Incognito and private browsing sessions**: Requests made in Incognito or private browsing windows always reject with `NotAllowedError` so private sessions remain indistinguishable from sessions without local credentials.

## Server-side setup

### Options generation endpoint

Expose an endpoint that generates discoverable WebAuthn request options for unauthenticated visitors:

1. **Include the server's predefined `rpId`**: Set `rpId` explicitly in the request options (matching the RP ID used during passkey registration) so the client can pass `publicKey.rpId` directly to Signal API calls.
2. **Generate a session-bound challenge**: Create a cryptographically random challenge buffer, store it in the server session, and encode it as Base64URL.
3. **Persist user verification preference**: Set `userVerification: 'preferred'` and store `expectedUserVerification: 'preferred'` in the session.
4. **Omit `allowCredentials`**: Do not include a non-empty `allowCredentials` list in the options for Immediate UI mode, as browsers reject non-empty allowlists with `NotAllowedError`.

```javascript
// Server-side options generation example (/api/login/options)
router.post('/api/login/options', (req, res) => {
  const options = {
    challenge: serverGeneratedBase64UrlChallenge, // High-entropy random challenge stored in session
    rpId: 'example.com',
    userVerification: 'preferred',
  };

  req.session.challenge = options.challenge;
  req.session.expectedUserVerification = 'preferred';
  return res.json(options);
});
```

### Dual credential verification endpoints

Because `navigator.credentials.get({ password: true, publicKey, uiMode: 'immediate' })` can resolve with either a passkey (`PublicKeyCredential`) or a saved password (`PasswordCredential`), provide verification handlers for both credential types:

1. **WebAuthn assertion verification (`/api/login/verify`)**: Verify the assertion against the session challenge and stored public key. If the credential ID is not found in the database, return HTTP status `404` so the client can notify the password manager via `PublicKeyCredential.signalUnknownCredential()`.
2. **Password verification (`/api/login/password`)**: Verify the `username` (`cred.id`) and `password` (`cred.password`) against the user database and establish an authenticated session.

## Client-side implementation


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/quick-sign-ins/guide.md#L1-L76). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
