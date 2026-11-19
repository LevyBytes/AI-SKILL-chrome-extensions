### Easy JSON serialization fallback

Baseline status for the api.PublicKeyCredential.parseRequestOptionsFromJSON_static capability: Newly available. It's been Baseline since 2025-03-31.
Supported by: Chrome 129 (Sep 2024), Edge 129 (Sep 2024), Firefox 119 (Oct 2023), and Safari 18.4 (Mar 2025).

Always install `'webauthn-polyfills'` and import it in the client bundle so `PublicKeyCredential.parseRequestOptionsFromJSON()` and `PublicKeyCredential.prototype.toJSON()` work consistently across browsers supporting `PublicKeyCredential`:

```javascript
import 'webauthn-polyfills';
```

### Signal API synchronization fallback

Browser support for Web authentication signal methods: Limited availability.
Supported by: Chrome 132 (Jan 2025), Edge 132 (Jan 2025), and Safari 26 (Sep 2025).
Unsupported in: Firefox.

The WebAuthn Signal API (`webauthn-signals`) is a progressive enhancement that removes stale passkeys from the user's password manager when the server responds with HTTP `404`.

- **Fallback experience**: Gate calls behind `if (PublicKeyCredential.signalUnknownCredential)`. When unsupported, skip the signal call gracefully and display a clear message guiding the user to sign in with an alternative method.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/security/quick-sign-ins.md#L229-L248). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
