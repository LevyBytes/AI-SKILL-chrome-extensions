## Fallback strategy

Email Verification (`autocomplete="email-verification-token"`) is designed as a **progressive enhancement** over traditional out-of-band email verification (OTP codes or magic links):

- **Unsupported browsers:** Browsers that do not support `autocomplete="email-verification-token"` ignore the hidden input and submit the form with an empty `token` value.
- **Unauthenticated or non-participating email domains:** When a user enters an email address whose domain does not publish an `_email-verification` DNS `TXT` record, or when the user does not have an active session with their email provider in the browser, the browser submits the form with an empty `token`.
- **Expired or invalid tokens:** If the `nonce` has expired, was already consumed, or fails any step of `verifyEmailVerificationToken` in `handleSignupSubmission`, the server catches the error and sends a traditional OTP or magic link email without interrupting the user's sign-up or sign-in flow.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/verify-email-ownership/guide.md#L236-L242). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
