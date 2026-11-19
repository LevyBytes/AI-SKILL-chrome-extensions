# Accessible Error Announcement

## The Problem
Standard HTML5 validation provides visual feedback (via `:invalid` or `:user-invalid`), but it doesn't automatically synchronize with accessibility attributes like `aria-invalid`. 

If you use standard `:invalid` styling, screen readers might announce "Invalid entry" the moment a user tabs into a required field that is currently empty. This creates a disruptive experience for users using assistive technologies, as the error is announced before interaction has occurred.

## The Solution
We want the *programmatic* state (`aria-invalid="true"`) to be applied **at the exact same moment** the *visual* state (`:user-invalid`) applies. Since `:user-invalid` relies on the browser's internal "user-interacted" flag, we can use JavaScript to check that this selector matches during standard interaction events.

Set `aria-invalid="false"` until `:user-invalid` matches, rather than leaving the attribute unset. Firefox and Safari expose an empty `required` field as invalid from page load, so an unset attribute still causes the premature "invalid entry" announcement there.

### Implementation Strategy

1.  **Visual Layer**: Use CSS `:user-invalid` to show borders/icons.
2.  **Accessibility Layer**: Use `aria-invalid`, and list the error message in `aria-describedby` while the field is invalid, to communicate state to Assistive Technology (AT). Announce an error that appears when the user leaves a field through one polite live region for the page.
3.  **Bridge Visual & Accessibility Layer**: Create a lightweight JavaScript utility that listens for `blur`, `change`, `input` and `invalid` events, checks if the element matches `:user-invalid`, and updates the ARIA attributes accordingly.
4.  **Focus on Submit**: Screen readers announce a field's error when focus reaches the field, so after a failed submit, move focus to the first invalid field, or to an error summary (a heading followed by a link to each invalid field) on a long form. Native validation moves focus to the first invalid field for you; if the form uses `novalidate`, move it in your submit handler.

## Implementation Guide

### 1. HTML Structure
Link your input to its error message by setting the input's `data-error` attribute to the error message's `id`. The script in section 3 lists that `id` in `aria-describedby` only while the field is invalid. Don't reference the error from `aria-describedby` in the markup: the error element is always in the page, and text that `aria-describedby` references is announced even when it's hidden, so the error would be read out before the user has interacted.

```html
<form>
  <div class="field">
    <label for="email">Email</label>
    <input 
      type="email" 
      id="email" 
      required 
      data-error="email-error"
    >
    <span id="email-error" class="error-msg">
      Please enter a valid email address.
    </span>
  </div>
</form>
```

### 2. CSS
Control the visibility of the error message using the native pseudo-class `:user-invalid`.

```css
.error-msg {
  display: none;
  color: #d93025;
}

/* Show error message when input is user-invalid */
input:user-invalid ~ .error-msg {
  display: block;
}

/* Optional: Visual cues on the input itself */
input:user-invalid {
  border-color: #d93025;
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/accessibility/accessible-error-announcement.md#L1-L61). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
