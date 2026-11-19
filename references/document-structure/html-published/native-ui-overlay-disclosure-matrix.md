### Code Example

```html
<!-- Popover (No JS required for toggle) -->
<button popovertarget="help-menu">Info</button>
<div id="help-menu" popover="auto">
  <p>Standard help text.</p>
</div>

<!-- Modal Dialog with Form-based closing -->
<button id="show-dialog">Open dialog</button>
<dialog id="fav-modal">
  <!-- method="dialog" closes the dialog natively and sets the returnValue -->
  <form method="dialog">
    <p>Confirm action?</p>
    <button value="cancel">Cancel</button>
    <button value="confirm">Confirm</button>
  </form>
</dialog>

<script>
  const dialog = document.getElementById("fav-modal");
  const openModal = document.getElementById("show-dialog");
  
  // Show modal dialog
  openModal.addEventListener('click', () => dialog.showModal());
  
  // Listen for the 'close' event to retrieve the user's choice (returnValue)
  dialog.addEventListener('close', () => {
    console.log(dialog.returnValue); // "confirm" or "cancel"
  });
</script>
```

### Native UI Overlay & Disclosure Matrix

| Feature | Modality | Focus | Dismiss Mechanism | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **`<dialog>`** | Modal / Non-modal | Automatic trap (Modal) | Esc / Form / `closedby` | Critical Actions, Settings |
| **`[popover]`** | Non-modal | Standard Tab flow | Light-dismiss (Click outside) | Menus, Tooltips, Toasts |
| **`<details>`** | Inline Disclosure | Standard Tab flow | Toggle summary | Accordions, FAQs |

**Heuristic Rule**: Use `<dialog>` for interruptions requiring user action, `popover` for transient info, and `<details>` for inline content expansion.

## 5. Disclosures: Details and Summary

### Guidelines

- **DO** use `<details>` and `<summary>` for a native disclosure pattern without JS.
- **DO** use `<details>` and `<summary>` for native accordion patterns without JS. For exclusive accordions, use the `name` attribute on the `<details>` elements. Wrap the entire accordion in a `<section>` element with an accessible name provided using either `aria-labelledby` (referencing the `id` attribute of the element that names this accordion) or `aria-label`
- **DO** place `<summary>` as the *first* child of `<details>`.
- If headings must be used within a `<summary>`, consider if the heading is essential for understanding or navigating the document structure. If it is, use a more robust disclosure approach that allows wrapping the disclosure trigger with the heading (e.g. `<h2><button type="button" aria-expanded="false" aria-controls="significant-section-content">Significant section</button></h2>`). This ensures the heading semantics aren’t lost, and the button and its state are announced.
- **DO** use `details[open]` attribute for styling expanded states.
- **DO** use `details::details-content` for styling the contents of the `<details>` element.

- **DON'T** nest other interactive elements (links, buttons) directly inside `<summary>` text as it may break expected focus behavior and screen reader announcements.
- **DON'T** hide visible triangles via `list-style: none` without providing explicit directional cues (via `::before`/`::after` pseudo-elements).
- **DON'T** use the `title` attribute to create tooltip effects, as these cannot be accessed using a keyboard. Instead, use accessible tooltip patterns that can be triggered using a keyboard, and are consistently announced by screen readers.
- **DON'T** provide text alternatives for custom state indicator icons (implemented using `<img>` or `<svg>` elements), as state should be communicated by the `<summary>` element, and a text alternative would duplicate this information

### Code Example

```html
<!-- Exclusive Accordion Set -->
<section aria-label="Frequently asked questions">
  <details name="faq">
    <summary>Item 1</summary>
    <p>Contents...</p>
  </details>
  <details name="faq">
    <summary>Item 2</summary>
    <p>Contents...</p>
  </details>
</section>
```

## 6. Focus Boundaries and Visibility

### Guidelines

- **DO** use the global `inert` attribute for entire hidden sections (off-screen menus, background while custom modal is open) to remove them from tab flows and accessibility trees.
- **DO** pair `[inert]` with CSS (`opacity: 0.5`) to visually signify inactivity.
- **DO** rely on natural DOM order for sequential navigation.
- **DO** ensure that focusable elements aren't obscured by anything when they receive focus (for example, focus should move to modal dialogs and be constrained in them, rather than being able to access obscured content behind the modal).
- **DO** maintain focus—moving it to a logical adjacent element or returning it to the trigger control—when the currently focused element is hidden or removed.
- **DO** move focus to the start of newly injected content when it is added in direct response to a user action that shifts the workflow into that content (e.g., opening a dialog or navigating to a new view), rather than for background or live-region updates.

- **DON'T** use positive `tabindex` values (e.g., `1`, `2`). Use `0` to add element to tab flow, or `-1` for JS program focus.
- **DON'T** alter focus flow using CSS properties (`flex-flow: row-reverse`, `order`) without aligning the DOM structure.
- **DON'T** use `node.focus({ preventScroll: true })` without usability validation; it can hide the focused element off-screen.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/html/html.md#L220-L310). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
