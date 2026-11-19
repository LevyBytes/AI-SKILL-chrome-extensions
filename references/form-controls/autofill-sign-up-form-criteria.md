# Expectations: `autofill-sign-up-form`

- `<input>` elements MUST be within a `<form>` element.
- The form MUST have a submit button using `<button>` or `<input type="submit">`.
- Every `<input>` in the form MUST be visually labeled using a `<label>` element.
- Every `<label>` MUST have a `for` attribute whose value matches the `id` of its associated `<input>`.
- The email input MUST have `type="email"`.
- The email input MUST have `autocomplete="username"`. Password managers recognize `username` even when `type="email"` is used.
- The password input MUST have `type="password"`.
- The password input MUST have `autocomplete="new-password"`.
- Both the email and password inputs MUST have the `required` attribute.
- There MUST be exactly one email input (do not double-up email fields).
- There MUST be exactly one password input (do not double-up password fields).
- DO NOT enforce Latin-only characters for name inputs. Name patterns MUST NOT restrict input to `[a-zA-Z]` only.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/forms/autofill-sign-up-form/expectations.md#L1-L14). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
