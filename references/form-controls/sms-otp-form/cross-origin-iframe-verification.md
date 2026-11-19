## Cross-origin iframe verification

Receiving an SMS OTP inside a cross-origin `<iframe>` is restricted by default and is primarily used for embedded payment confirmation flows (such as 3D Secure verification where `shop.example` embeds an issuer challenge from `bank.example`). Supporting WebOTP inside a cross-origin `<iframe>` requires three coordinated configurations:

1. **Bind both origins on the last line of the SMS**: List the top-level embedding domain first (`@shop.example`), followed by `#<otp>`, followed by a space and the embedded iframe domain (`@bank.example`):

```text
Your verification code is 123456.

@shop.example #123456 @bank.example
```

2. **Send the `Permissions-Policy` HTTP response header**: Delegate `otp-credentials` to the cross-origin iframe origin in the parent document's HTTP headers:

```http
Permissions-Policy: otp-credentials=(self "https://bank.example")
```

3. **Add `allow="otp-credentials"` to the `<iframe>` element**: Explicitly grant the permission policy on the `<iframe>` tag in the embedding page and include a descriptive `title` attribute for screen readers:

```html
<iframe
  src="https://bank.example/verify"
  allow="otp-credentials"
  title="Payment verification">
</iframe>
```

Inside the `<iframe>` document served by `https://bank.example`, run the same `<form>` markup and `navigator.credentials.get({ otp: { transport: ['sms'] }, signal: ac.signal })` verification lifecycle shown above.

## Fallback strategies

### WebOTP API fallback

{{ BASELINE_STATUS("web-otp") }}

If your target browsers do not support the WebOTP API (`OTPCredential`), do not load a third-party JavaScript polyfill, as reading incoming SMS messages requires operating-system-level integration. Instead, rely on the three-tier progressive enhancement built into the `<input>` markup:

- **Progressive enhancement experience**: Guard the `navigator.credentials.get({ otp: { transport: ['sms'] } })` call behind `if ('OTPCredential' in window)`. When `OTPCredential` is unavailable:
    1. Browsers that support `autocomplete="one-time-code"` (such as Safari on iOS 14+, iPadOS, and macOS with iCloud SMS relay) parse the `@domain #code` SMS and present the code in the system keyboard autofill bar when the `<input>` is focused.
    2. All other browsers fall back to manual entry in the single `<input type="text" inputmode="numeric" pattern="\d{6}" maxlength="6" required>`, displaying a numeric keypad on mobile devices and submitting via the `<button type="submit">`.

### Permissions Policy fallback

{{ BASELINE_STATUS("permissions-policy") }}

If the browser does not support delegating `otp-credentials` via `Permissions-Policy` and `<iframe allow="otp-credentials">`, the embedded verification `<form>` inside the cross-origin `<iframe>` degrades gracefully to `autocomplete="one-time-code"` keyboard suggestions and manual numeric input without throwing unhandled exceptions.

### Inputmode and AbortController support

{{ BASELINE_STATUS("inputmode") }}

{{ BASELINE_STATUS("aborting") }}

Both the HTML `inputmode` attribute and `AbortController` (`AbortSignal`) are supported across modern browsers and require no polyfill or fallback code.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/forms/sms-otp-form/guide.md#L158-L212). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
