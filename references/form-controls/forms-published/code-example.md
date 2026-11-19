### Code Example

```html
<div class="field">
  <label for="username">Username: <span aria-hidden="true">*</span></label>
  <input type="text" id="username" name="username" aria-describedby="user-help" required>
  <span id="user-help" class="hint">3-12 characters.</span>
</div>

<style>
  .field {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  margin-block-end: 1.5rem;
  }

  input:focus-visible {
    outline: 3px solid #0b57d0;
    outline-offset: 2px;
  }
</style>
```

## 3. Autofill and Input Hints

### Guidelines

- **DO** use the `autocomplete` attribute to specify expected data (e.g., `email`, `tel`, `current-password`, `new-password`).
- **DO** use `inputmode` to optimize on-screen keyboards (e.g., `inputmode="numeric"` for PINs).
- **DO** use `enterkeyhint` to set the Enter key label (e.g., `next`, `done`).
- **DO** turn off text correction on fields that hold identifiers rather than prose: `autocorrect="off"` (plus `autocapitalize="none"` and `spellcheck="false"`) on usernames, emails, URLs, codes, and search inputs. Leave the defaults on for free-text fields like messages and comments.
- **DO** use single-field inputs for complex numbers (credit cards, phones) to help autofill.
- **DO** use a single `<input type="text" inputmode="numeric" autocomplete="one-time-code">` and the WebOTP API for SMS one-time passcode verification. See guide `sms-otp-form` (via `npx -y modern-web-guidance@latest retrieve "sms-otp-form"`).

- **DON'T** use `type="number"` for credit cards, ZIP codes, or one-time passcodes (causes UI scroll issues and removes leading zeros).
- **DON'T** split a single value (such as a 6-digit OTP, phone number, or credit card) across multiple `<input>` boxes that auto-advance focus on keypress. Instead, use `type="text"` with `inputmode="numeric"` (`type=number` adds spinner buttons). If needed, styling can convey a similar UI. JS can set a `--value-length` CSS variable for higher fidelity styling that resembles these inputs, without their usability and accessibility issues.
- **DON'T** block copy-and-paste (`paste` events) or disable `autocomplete` on passwords, verification codes, or other authentication fields.

### Code Example

```html
<label for="zip">ZIP Code:</label>
<input type="text" id="zip" name="zip" autocomplete="postal-code" inputmode="numeric" pattern="\d{5}" enterkeyhint="next">

<label for="username">Username:</label>
<input type="text" id="username" name="username" autocomplete="username" autocorrect="off" autocapitalize="none" spellcheck="false" enterkeyhint="done">
```

## 4. Constraints and Validation

### Guidelines

- **DO** use native constraints: `required`, `minlength`, `maxlength`, `pattern`.
- **DO** use CSS pseudo-classes `:user-invalid` for non-intrusive styling.
- **DO** use the ValidityState API (`setCustomValidity`) for custom messaging and write clear error messages that explain how to fix the issue.
- **DO** move focus to the first invalid field (or an error summary) when a form submission fails validation.

- **DON'T** use the raw `:invalid` CSS pseudo-class alone for error styling to ensure empty required fields are not marked as invalid before the user interacts with the form.
- **DON'T** disable submit buttons to block validation; let users submit and highlight errors. However, **DO** disable the button *after* a valid submission is clicked to prevent double-posts.
- **DON'T** trigger validation errors or `aria-live` error announcements on every keystroke while the user is typing (validate on submit or `blur`, and clear errors on `input` once resolved).

### Code Example

```html
<label for="code">Activation Code (4 digits):</label>
<input type="text" id="code" name="code" required pattern="\d{4}">

<script>
  const input = document.getElementById('code');
  input.addEventListener('invalid', () => {
    input.setCustomValidity('Please enter exactly 4 digits.');
  });
  input.addEventListener('input', () => {
    input.setCustomValidity('');
  });
</script>
```

### Validation Event Timing Matrix

| Event Trigger | Phase | Action Allowed | UX / Accessibility Logic |
| :--- | :--- | :--- | :--- |
| **`input`** | Active Typing | **Clear** existing errors only. | **Non-intrusive**: Do not yell at the user before they finish typing. |
| **`blur` / `focusout`** | Exiting Field | **Run** check (if edited) and show error. | **Contextual validation**: Validate once the user indicates they are "done" with a field. |
| **`submit`** | Final Attempt | **Block** and route focus. | **Final gatekeeper**: Intercepts bad payloads and moves keyboard and screen reader focus to the first invalid field or an error summary. |

**Single-Sentence Mental Model**: "Validate on `blur` (if edited) to avoid premature warnings while typing, and reset error states on `input` as soon as the user fixes the value, and route the focus to the first error or summary on `submit`."

**Security vs UX Scale**: Client-side validation is for User Experience; Server-side validation is for Security. Never treat browser constraints as a data integrity defense.

## 5. Responsive Design and Typography


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/forms/forms.md#L77-L170). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
