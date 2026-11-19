```yaml
---
name: forms
description: Best practices for building accessible, secure, and user-friendly web forms. Use this guide when creating or modifying forms, inputs, and submission flows.
---
```

# Forms

## 1. Semantic Structure and Form Element

### Guidelines

- **DO** use the `<form>` element to wrap interactive controls for data collection.
- **DO** wrap search forms and filtering controls in a `<search>` element.
- **DO** give `<form>` elements an accessible name via `aria-labelledby` (pointing to the form's heading) when a page has multiple forms.
- **DO** use `method="POST"` for sensitive data and mutations; use `method="GET"` for idempotent requests (e.g., search).
- **DO** specify the `action` attribute for the destination URL.
- **DO** specify a `name` attribute for every form control to identify data on submission.
- **DO** use semantic tags like `<button type="submit">`, `<textarea>`, `<select>`, and specific `<input>` types.
- **DO** explicitly set `type="button"` on secondary or helper buttons so they don't default to type="submit".
- **DO** use `<fieldset>` and `<legend>` (with `<legend>` as the first child) to group related controls. **DON'T** use `<fieldset>` for visual styling without a `<legend>`
- **DO** use actionable language on submit buttons (e.g., "Save changes").

- **DON'T** nest `<form>` elements inside other `<form>` elements.
- **DON'T** use `GET` for sensitive data (it exposes data in history/logs).
- **DON'T** use generic `<div>`, `<span>`, or `<a>` elements for form controls.
- **DON'T** use `type="button"` for primary submission buttons.
- **DON'T** disable textarea resizing without alternate layout provisions.
- **DON'T** use CSS to visually reorder form controls away from their DOM/keyboard `Tab` order.
- **DON'T** auto-submit a form when a user changes `<select>`, radio buttons, or checkbox without an explicit submit action.

### Code Example

```html
<search>
  <form action="/search" method="GET">
    <label for="q">Search query</label>
    <input type="search" id="q" name="q">
  
    <fieldset>
      <legend>Search filters</legend>
      <input type="checkbox" id="exact" name="exact" value="true">
      <label for="exact">Exact match only</label>
      <input type="checkbox" id="archived" name="archived" value="true">
      <label for="archived">Include archived results</label>
    </fieldset>

    <button type="submit">Search</button>
  </form>
</search>
```

### Selection Control Decision Matrix

| Options Count | Choice Type | Recommended Element | Usability & Accessibility Logic |
| :--- | :--- | :--- | :--- |
| **1** | Binary toggle (Yes/No) | `<input type="checkbox">` | **Reversible State**: Can be checked and unchecked with space unlike a radio button, which gets stuck once checked. |
| **2–5** | Single (Exclusive) | `<input type="radio">` | **Zero-click scanning**: All choices are immediately visible. Faster scan time. |
| **6+** | Single (Exclusive) | `<select>` | **Space conservation**: Use only when vertical space is premium or the list is long. |
| **10+ / Dynamic** | Single (Exclusive) | `<input list="id">` (`<datalist>`) | **Fuzzy Search**: Prevents scrolling fatigue in massive sets (e.g., countries). |
| **2+** | Multi-select | `<input type="checkbox">` | **Standard semantics**: Native non-exclusive toggles. |

**Single-Sentence Mental Model**: "Expose 2 to 5 mutually exclusive options as visible radio buttons when choices are fewer than six; use `<select>` only when space is constrained or the list is long."

## 2. Accessible Labeling and State

### Guidelines

- **DO** always associate `<label>` with its input using `for` and `id`.
- **DO** place `<label>` elements before text inputs, `<textarea>`, and `<select>` controls in the DOM and stack them visually above the control for faster scanning.
- **DO** place `<label>` elements inline immediately after `<input type="checkbox">` and `<input type="radio">` controls for consistent alignment.
- **DO** use visible labels and keep critical format instructions (e.g., `3-12 characters`) in the label or persistent helper text; do not rely on `placeholder` alone.
- **DO** ensure the vertical margin between a label and its input is less than the margin between form groups (**Gestalt Proximity Rule**).
- **DO** set `aria-invalid="true"` on form controls that fail custom validation, and clear it once resolved.
- **DO** use `aria-describedby` to link inputs with help text or error messages.
- **DO** define the `lang` attribute on `<html>` for proper device translation.
- **DO** use non-color visual cues (icons, text) to communicate state (don't rely on color alone).
- **DO** indicate clearly which fields are required both visually in the label and programmatically with the `required` attribute.
- **DO** use `aria-live` for dynamic error announcements.
  
- **DON'T** use `aria-label` when a visible `<label>` can be used or override visible text with a mismatched `aria-label`.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/forms/forms/guide.md#L1-L81). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
