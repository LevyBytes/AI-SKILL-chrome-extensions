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

Browser support for WebOTP: Limited availability.
Supported by: Chrome 93 (Aug 2021), Edge 93 (Sep 2021), and Safari 27 (Sep 2026).
Unsupported in: Firefox.

If your target browsers do not support the WebOTP API (`OTPCredential`), do not load a third-party JavaScript polyfill, as reading incoming SMS messages requires operating-system-level integration. Instead, rely on the three-tier progressive enhancement built into the `<input>` markup:

- **Progressive enhancement experience**: Guard the `navigator.credentials.get({ otp: { transport: ['sms'] } })` call behind `if ('OTPCredential' in window)`. When `OTPCredential` is unavailable:
    1. Browsers that support `autocomplete="one-time-code"` (such as Safari on iOS 14+, iPadOS, and macOS with iCloud SMS relay) parse the `@domain #code` SMS and present the code in the system keyboard autofill bar when the `<input>` is focused.
    2. All other browsers fall back to manual entry in the single `<input type="text" inputmode="numeric" pattern="\d{6}" maxlength="6" required>`, displaying a numeric keypad on mobile devices and submitting via the `<button type="submit">`.

### Permissions Policy fallback

Browser support for Permissions policy: Limited availability.
Supported by: Chrome 108 (Nov 2022) and Edge 108 (Dec 2022).
Unsupported in: Firefox and Safari.

If the browser does not support delegating `otp-credentials` via `Permissions-Policy` and `<iframe allow="otp-credentials">`, the embedded verification `<form>` inside the cross-origin `<iframe>` degrades gracefully to `autocomplete="one-time-code"` keyboard suggestions and manual numeric input without throwing unhandled exceptions.

### Inputmode and AbortController support

Baseline status for inputmode: Widely available. It's been Baseline since 2021-12-07.
Supported by: Chrome 66 (Apr 2018), Edge 79 (Jan 2020), Firefox 95 (Dec 2021), Safari 12.1 (Mar 2019), and Safari iOS 12.2 (Mar 2019).

Baseline status for AbortController and AbortSignal: Widely available. It's been Baseline since 2019-03-25.
Supported by: Chrome 66 (Apr 2018), Edge 16 (Oct 2017), Firefox 57 (Nov 2017), Safari 12.1 (Mar 2019), and Safari iOS 12.2 (Mar 2019).

Both the HTML `inputmode` attribute and `AbortController` (`AbortSignal`) are supported across modern browsers and require no polyfill or fallback code.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/forms/sms-otp-form.md#L148-L208). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
