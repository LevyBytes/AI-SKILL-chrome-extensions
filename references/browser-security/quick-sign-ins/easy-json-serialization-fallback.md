### Easy JSON serialization fallback

{{ BASELINE_STATUS("webauthn", "api.PublicKeyCredential.parseRequestOptionsFromJSON_static") }}

Always install `'webauthn-polyfills'` and import it in the client bundle so `PublicKeyCredential.parseRequestOptionsFromJSON()` and `PublicKeyCredential.prototype.toJSON()` work consistently across browsers supporting `PublicKeyCredential`:

```javascript
import 'webauthn-polyfills';
```

### Signal API synchronization fallback

{{ BASELINE_STATUS("webauthn-signals") }}

The WebAuthn Signal API (`webauthn-signals`) is a progressive enhancement that removes stale passkeys from the user's password manager when the server responds with HTTP `404`.

- **Fallback experience**: Gate calls behind `if (PublicKeyCredential.signalUnknownCredential)`. When unsupported, skip the signal call gracefully and display a clear message guiding the user to sign in with an alternative method.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/quick-sign-ins/guide.md#L236-L252). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
