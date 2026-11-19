# Required Field Feedback

## The Problem
Marking required fields with an error state immediately upon page load can be confusing. Ideally, a required field should only look "invalid" if the user has attempted to fill it out and failed.

## The Solution
The `:user-invalid` pseudo-class solves this perfectly. For a required field, it will not match on page load. It will only match if:
1.  The user interacts with the field (e.g., types a character and deletes it) and then leaves it (blur), leaving it empty.
2.  The user attempts to submit the form while the field is empty.

### Implementation Strategy

1.  **HTML Constraint**: Add the `required` attribute to your inputs.
2.  **Visual Feedback**: Use `:user-invalid` to style the border red and show a "Required" helper text.
3.  **Timing**: Rely on the browser's native timing for visual feedback. You don't need `onBlur` handlers to add a `touched` class anymore, though some JavaScript is still needed to sync ARIA attributes (see below).
4.  **Error Text**: Show visible error text with the error styling, so the error isn't shown by color alone. Start each message with an error icon that has a text alternative such as "Error" (the safest choice), or word every message as an error, for example "Name is required.", and use the same approach for every error in the form.
5.  **Error Link**: List the error message in the field's `aria-describedby` only while the field is invalid, so screen readers read it with the field. A reference in the markup would read the hidden message from page load. The script in section 3 does this for each field whose `data-error` attribute is set to its error message's `id`.

## Implementation Guide

### 1. HTML Structure
```html
<form id="feedback-form">
  <div class="field">
    <label for="full-name">Full Name</label>
    <!-- Set data-error to the error message's id. The aria-invalid script lists that id in aria-describedby while the field is invalid. -->
    <input
      type="text"
      id="full-name"
      name="full-name"
      required
      data-error="name-error"
    >
    <!-- MANDATORY: Include an icon or distinct non-color indicator alongside error text -->
    <div id="name-error" class="error-msg">
      <span role="img" aria-label="Error">❌</span> This field is required.
    </div>
  </div>
</form>
```

### 2. CSS
```css
.error-msg {
  display: none;
  color: #d93025;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/*
  Only highlight empty required fields AFTER the user interacts with them or attempts submission.
  MANDATORY: Provide multiple indicators (border shift + helper text/icon) to avoid color-only state communication.
*/
input:user-invalid {
  border-color: #d93025;
  background-color: #fce8e6;
}

input:user-invalid + .error-msg {
  display: block;
}

/* Optional: Subtle indicator for required fields that are valid */
input:required:user-valid {
  border-color: #188038;
  border-width: 2px;
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/forms/required-field-feedback.md#L1-L70). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
