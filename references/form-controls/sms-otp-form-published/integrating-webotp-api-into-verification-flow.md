## Integrating the WebOTP API into your verification flow

The WebOTP API (`OTPCredential`) requires a Secure Context (`https://` in production, or `http://localhost` during local development). Instead of pasting a disconnected `DOMContentLoaded` script that queries the DOM and calls `form.submit()`, integrate `navigator.credentials.get()` directly into the lifecycle and submission handler of your verification UI:

- **Tie the request lifecycle to the active OTP step**: Start listening for the OTP when the verification input is rendered and active (for example, when the OTP step mounts after the user requests an SMS code, and again whenever the user clicks a "Resend code" button).
- **Manage an `AbortController` across all exit paths**: Pass an `AbortSignal` (`signal: ac.signal`) to `navigator.credentials.get()`. Call `ac.abort()` whenever:
    - The user manually submits the form (or submits a code filled via `autocomplete="one-time-code"`).
    - A new SMS code is requested ("Resend code"), aborting the previous controller before creating a new one.
    - The verification component, dialog, or route unmounts.
- **Trigger the application's submission handler (`form.requestSubmit()`)**: When `navigator.credentials.get()` resolves with `otp`, set `otpInput.value = otp.code` and call `form.requestSubmit()` (or invoke your verification function directly). Do **NOT** call `form.submit()`, because `form.submit()` bypasses `submit` event listeners (`event.preventDefault()` / `fetch()` handlers) and skips native constraint validation.

```javascript
const otpForm = document.getElementById('otp-form');
const otpInput = document.getElementById('otp-input');

let otpAbortController = null;

function stopSmsOtpListener() {
  if (otpAbortController) {
    otpAbortController.abort();
    otpAbortController = null;
  }
}

async function startSmsOtpListener() {
  // Feature-detect WebOTP support
  if (!otpInput || !('OTPCredential' in window)) {
    return;
  }

  // Cancel any previous pending WebOTP request (e.g., when re-sending an SMS code)
  stopSmsOtpListener();
  const ac = new AbortController();
  otpAbortController = ac;

  try {
    const otp = await navigator.credentials.get({
      otp: { transport: ['sms'] },
      signal: ac.signal,
    });

    if (!otp) return;
    otpInput.value = otp.code;

    // Trigger standard form submission so submit event listeners and validation run
    if (otpForm) {
      otpForm.requestSubmit();
    }
  } catch (err) {
    // Expected when aborted by manual submission, resend, unmount, or user dismissal
    if (err && err.name === 'AbortError') {
      return;
    }
    console.error('WebOTP verification error:', err);
  }
}

otpForm.addEventListener('submit', async (event) => {
  // MANDATORY: Abort any in-flight WebOTP request when the form is submitted
  stopSmsOtpListener();

  // Application-specific submission logic (e.g., AJAX fetch or native POST)
  event.preventDefault();
  const formData = new FormData(otpForm);
  // await fetch(otpForm.action, { method: 'POST', body: formData });
});

// Start listening when the OTP verification step becomes active
startSmsOtpListener();
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/forms/sms-otp-form.md#L77-L147). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
