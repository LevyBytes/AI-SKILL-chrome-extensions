Related section: [Form fields automatically fit contents](overview.md).
### Fallback strategies

Baseline status for field-sizing: Newly available. It's been Baseline since 2026-06-16.
Supported by: Chrome 123 (Mar 2024), Edge 123 (Mar 2024), Firefox 152 (Jun 2026), and Safari 26.2 (Dec 2025).

`field-sizing` should be treated as a progressive enhancement. In browsers that do not support the property, form controls gracefully degrade back to their default, fixed sizing behavior. Users will simply experience standard scrolling for overflowing content inside fixed-size inputs and textareas.

If dynamically growing fields are absolutely required for older browsers, you must use feature detection and a complex workaround. The most robust fallback for textareas uses a CSS Grid trick where a hidden pseudo-element mirrors the user's input in real-time, forcing the grid container (and the textarea inside it) to expand.

```html
<!-- The textarea is wrapped in a container that will mirror its value -->
<div class="growable-textarea" data-replicated-value="">
  <textarea></textarea>
</div>
```

```javascript
// Only attach the fallback event listeners if field-sizing is unsupported
if (!CSS.supports('field-sizing', 'content')) {
  document.querySelectorAll('.growable-textarea > textarea').forEach(textarea => {
    textarea.addEventListener('input', () => {
      textarea.parentNode.dataset.replicatedValue = textarea.value;
    });
  });
}
```

```css
/* Only apply the fallback if field-sizing is NOT supported */
@supports not (field-sizing: content) {
  .growable-textarea {
    display: grid;
  }

  /* The pseudo-element and textarea must share the exact same cell, font, and padding */
  .growable-textarea::after,
  .growable-textarea > textarea {
    grid-area: 1 / 1 / 2 / 2;
    font: inherit;
    padding: 0.5rem;
    border: 1px solid #999;
  }

  /* The pseudo-element renders the copied text invisibly to stretch the grid */
  .growable-textarea::after {
    /* The space is necessary for trailing empty lines to be rendered */
    content: attr(data-replicated-value) " ";
    white-space: pre-wrap;
    visibility: hidden;
  }

  .growable-textarea > textarea {
    resize: none;
    overflow: hidden;
  }
}
```

Given the complexity of duplicating styles and synchronizing state across DOM nodes for every form control, relying on the default fallback behavior of fixed inputs is the recommended approach for most applications unless dynamic sizing is critical to the user experience.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/forms/form-fields-automatically-fit-contents.md#L64-L122). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
