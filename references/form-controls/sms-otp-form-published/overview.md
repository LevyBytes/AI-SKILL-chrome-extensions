# SMS OTP form verification

Delivering a one-time passcode (OTP) via SMS is a common flow for phone number verification, account recovery, step-up authentication, and payment confirmation. Switching between a browser and an SMS messaging app to memorize or copy-paste a multi-digit code introduces user friction, increases drop-off rates, and leaves users vulnerable to phishing on spoofed domains.

Combining semantic `<form>` markup, `<input autocomplete="one-time-code" inputmode="numeric">`, origin-bound SMS formatting (`@domain #code`), and the WebOTP API (`OTPCredential`) creates a layered, progressively enhanced verification flow:

1. **Automatic extraction and submission**: Browsers supporting the WebOTP API verify the origin against the `@domain #code` line in the SMS, populate the `<input>`, and trigger verification with a single tap.
2. **Origin-bound keyboard autofill**: Browsers and operating systems that support `autocomplete="one-time-code"` (such as Safari on iOS, iPadOS, and macOS) parse the `@domain #code` message and suggest the code in the keyboard autofill bar only when the domain matches.
3. **Frictionless manual entry**: Users entering a code from another device receive a numeric virtual keypad via `inputmode="numeric"` without the usability hazards of `<input type="number">`.

## Security considerations

SMS OTP verifies possession of a phone number and provides convenient step-up verification, but SMS transport and phone numbers can be subject to SIM swapping, number recycling, and interception. Always pair client-side autofill and the WebOTP API with the origin-bound `@domain #code` SMS format so the browser and OS verify that the target domain matches before suggesting or delivering the code. For primary phishing-resistant authentication, prefer passkeys over SMS-based codes (see `passkeys` (via `npx -y modern-web-guidance@latest retrieve "passkeys"`)).

## Semantic form markup

Wrap the verification control in a semantic `<form>` element with `method="POST"` and an explicit `<button type="submit">`. Always use a single `<input>` element rather than splitting digits across multiple boxes.

- **Use `type="text"` with `inputmode="numeric"`**: Never use `type="number"` for OTP codes. A one-time passcode is an identifier string that may contain leading zeros (such as `012345`), not a countable quantity. Using `type="number"` adds increment/decrement spinner buttons, can strip leading zeros, and allows accidental scroll-wheel value changes. Also avoid `type="tel"`, which is a legacy workaround intended for full telephone numbers. Pair `type="text"` with `inputmode="numeric"` to present a digits-only virtual keyboard on mobile devices.
- **Add `autocomplete="one-time-code"`**: Instructs browsers and operating systems to suggest incoming SMS verification codes in the autofill bar when the `<input>` is focused.
- **Place instructional hints above the `<input>`**: Associate a visible `<label>` using `for` and `id`, and place any format instructions (linked via `aria-describedby`) visually **above** the `<input>` so autofill popovers and mobile virtual keyboards never cover the instructions.
- **Do not split digits across multiple `<input>` elements**: Multi-box OTP patterns (six separate `maxlength="1"` inputs) break native `autocomplete="one-time-code"` autofill in many browsers, hinder copy-pasting, and complicate screen reader navigation. If a segmented visual design is required, style a single `<input>` with `letter-spacing` and a monospace font.

```html
<form id="otp-form" action="/verify-otp" method="POST">
  <div class="form-group">
    <label for="otp-input">Verification code</label>
    <!-- Place the hint above the input so autofill popovers and mobile keyboards do not obscure it -->
    <p id="otp-format-hint" class="field-hint">
      Enter the 6-digit code sent to your phone.
    </p>
    <!-- MANDATORY: Use a single input with type="text", inputmode="numeric", and autocomplete="one-time-code" -->
    <input
      type="text"
      id="otp-input"
      name="otp"
      inputmode="numeric"
      autocomplete="one-time-code"
      pattern="\d{6}"
      maxlength="6"
      aria-describedby="otp-format-hint"
      required>
  </div>
  <button type="submit">Verify code</button>
</form>
```

```css
/* Optional: Style a single input to visually space digits without splitting the DOM element */
#otp-input {
  font-family: ui-monospace, monospace;
  font-size: 1.25rem; /* Example value: must be at least 1rem (16px) to prevent mobile browser auto-zoom */
  letter-spacing: 0.35em;
  min-height: 48px;
  padding: 0.5rem 0.75rem;
  box-sizing: border-box;
}
```

## Origin-bound SMS message format

For both the WebOTP API and Safari's domain-bound `autocomplete="one-time-code"` autofill to verify that the code belongs to your website, your backend SMS service must format the **last line** of the text message with the origin domain prefixed by `@` and the OTP prefixed by `#`:

```text
Your verification code is 123456.

@example.com #123456
```

Enforce the following formatting rules on the outgoing SMS message:

- **Include human-readable text first**: Always start the SMS with a clear human-readable sentence containing the code so users typing it manually on another device can read it easily.
- **Place `@<domain> #<otp>` on the very last line**: The `@` character must be the first character of the final line, with no trailing lines or signature text after it.
- **Use only the host domain**: Do not include a URL scheme (`https://` or `http://`), port (`:8080`), or path (`/verify`) in the `@domain` token.
- **Separate tokens with a single space**: Place exactly one space between `@<domain>` and `#<otp>`, and never include whitespace inside the domain or between `#` and the code.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/forms/sms-otp-form.md#L1-L76). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
