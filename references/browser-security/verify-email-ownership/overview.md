```yaml
---
name: verify-email-ownership
description: Verify that a user owns an email address during account creation, sign-in, or recovery without sending a one-time passcode or magic link email.
web-feature-ids:
  - tmp-email-verification
---
```

# Verify email address ownership

When collecting an email address during sign-up, sign-in, checkout, or account recovery, verifying ownership traditionally requires sending an out-of-band one-time passcode (OTP) or magic link. This forces users to leave your page, wait for email delivery, and copy codes—introducing friction, drop-off, and phishing risk, while also revealing to the email provider which relying party (RP) the user is visiting.

The **Email Verification API** (client-side HTML extension) and **Email Verification Protocol (EVP)** (backend cryptographic protocol) enable a relying party to verify that a user controls an email address without sending a verification email. The browser intermediates between the relying party and the user's email provider (the issuer):

1. The relying party includes a hidden `<input>` with `autocomplete="email-verification-token"` and a single-use cryptographic `nonce` in the same `<form>` as the email input.
2. When the user selects or enters an email address, the browser looks up the domain's `_email-verification.<domain>` DNS `TXT` record, verifies the user has an active session with the authoritative issuer, and requests an **Email Verification Token (EVT)** without disclosing the relying party's identity to the issuer.
3. The browser binds the EVT to the relying party's origin and session `nonce` in a **Key Binding JWT (KB-JWT)** signed with an ephemeral browser key pair (`EVT + KB-JWT`), populates the hidden input, and submits the form.
4. The relying party's backend verifies the cryptographic chain and, if valid, skips the email OTP or magic link step.

## 1. Enable the Origin Trial and Render the Verification Form

To participate as a verifying site (relying party):

1. **Provide the Origin Trial token** on the page hosting the form using either the `Origin-Trial` HTTP response header or a `<meta http-equiv="origin-trial">` element.
   - **Third-party origin trials:** Embedded identity SDKs can inject a third-party trial token, provided the Origin Trial registrant origin matches the issuer domain (same-site with the issuer, such as `https://issuer.example`).
2. **Generate a cryptographically random nonce per form render** with at least 128 bits of entropy (for example, `randomBytes(32).toString('base64url')` from `node:crypto`), store it in **server-side session state** keyed by an `HttpOnly`, `Secure`, `SameSite=Lax` session ID cookie (never store the expected `nonce` value directly inside a client cookie where an attacker could replay both the cookie and token), and render it into the hidden token input's `nonce` attribute. Serve the page with `Cache-Control: no-store` so back/forward navigation does not reuse an already-consumed nonce.
3. **Add the hidden token input** (`autocomplete="email-verification-token"`) inside the same `<form>` as the email input (`autocomplete="email"`).

```html
<!-- Serve with:
     Origin-Trial: <YOUR_ORIGIN_TRIAL_TOKEN>
     Cache-Control: no-store -->
<form method="POST" action="/api/verify-email">
  <label for="email">Email address:</label>
  <input
    type="email"
    id="email"
    name="email"
    autocomplete="email"
    required
  />

  <!-- MANDATORY: Must be in the same <form> as the email input.
       The nonce value must be freshly generated on the server per form render. -->
  <input
    type="hidden"
    name="token"
    nonce="SERVER_GENERATED_PER_FORM_NONCE"
    autocomplete="email-verification-token"
  />

  <button type="submit">Continue</button>
</form>
```

## 2. Verify the Submitted Token on the Server

When the form is submitted, treat the `token` field as untrusted input. Atomically read and delete the expected `nonce` from your server-side session store on receipt. If the `token` field is empty (for example, in browsers that do not support EVP or when the user is signed out of their email provider) or if verification fails, fall back immediately to your standard email OTP or magic link flow:

```javascript
// Replace with your public relying-party origin
const RP_ORIGIN = 'https://rp.example.com';

export async function handleSignupSubmission(request) {
  const formData = await request.formData();
  const submittedEmail = String(formData.get('email') || '').trim();
  const rawToken = String(formData.get('token') || '').trim();
  // Atomically read and delete the single-use nonce from server-side session state
  const expectedNonce = await consumeSessionNonce(request);

  if (rawToken && expectedNonce) {
    try {
      await verifyEmailVerificationToken({
        rawToken,
        submittedEmail,
        expectedNonce,
        expectedAudience: RP_ORIGIN,
      });
      // Fast path: email ownership is cryptographically verified; skip OTP email.
      return completeAccountCreation(submittedEmail);
    } catch (err) {
      // Log token verification failures before falling back to standard email verification.
      console.error('Email verification token check failed:', err);
    }
  }

  // Fallback path: send standard OTP code or magic link email to submittedEmail.
  return sendTraditionalVerificationEmail(submittedEmail);
}
```

Always use established SD-JWT and JOSE/JWT libraries for your backend platform (such as `@sd-jwt/core` and `jose` in Node.js, `sd-jwt-python` / `jwcrypto` in Python, or `sd-jwt-java` / Nimbus JOSE+JWT on the JVM) to implement `verifyEmailVerificationToken` rather than hand-rolling custom JWT or SD-JWT parsing code.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/verify-email-ownership/guide.md#L1-L92). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
