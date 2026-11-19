Related section: [JavaScript Fallback](javascript-fallback.md).
```yaml
---
name: style-parent-with-has
description: Style parent elements of a form field (e.g. labels or fieldsets) when the field is invalid.
web-feature-ids:
  - user-pseudos
---
```

# Style a Form Group When a Field Is Invalid with :has()

## The Problem
Often, an error state requires styling elements *outside* the input itself—for example, changing the color of a parent `fieldset` border, highlighting the `<label>`, or showing a global error icon in the card header. Historically, this required JavaScript to toggle classes on parent elements.

## The Solution
By combining `:has()` with `:user-invalid`, we can declaratively style any ancestor based on the validity state of a specific descendant. This keeps all presentation logic in CSS.

### Implementation Strategy

1.  **Selector**: Use `.parent:has(:user-invalid)` to target the container.
2.  **Scope**: Be specific to avoid performance issues. Target `.field-group` rather than `body`.
3.  **Fallback**: Requires JS to toggle classes on the parent if `:has()` is not supported.

## Implementation Guide

### 1. HTML Structure
```html
<form>
  <div class="card-section">
    <div class="header">
      <h3>Profile Settings</h3>
      <span class="status-icon"></span>
    </div>

    <div class="field">
      <label for="username">Username</label>
      <input type="text" id="username" required>
    </div>
  </div>
</form>
```

### 2. CSS
```css
/* Default State */
.card-section {
  border: 1px solid #ccc;
  border-left: 4px solid #ccc;
}

/*
  Parent Styling Logic:
  If the card contains ANY user-invalid input, turn the whole card's edge red.
*/
.card-section:has(:user-invalid) {
  border-left-color: #d93025;
  background-color: #fff8f8;
}

/* Change the icon too */
.card-section:has(:user-invalid) .status-icon::after {
  content: "⚠️" / "Error";
}
```

Parent styling only adds emphasis: it doesn't say which field is wrong or why, so each field still needs its own visible error text. See {{ GUIDE_REF("required-field-feedback") }}.

## Fallbacking & Browser Support

{{ BASELINE_STATUS("user-pseudos") }}

### CSS for Fallback
We use a class `.has-error` on the parent to mimic the `:has()` behavior.

```css
/* Native */
.card-section:has(:user-invalid) {
  border-left-color: #d93025;
}

/* Fallback */
.card-section.has-error-fallback {
  border-left-color: #d93025;
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/css/style-parent-with-has/guide.md#L1-L84). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
