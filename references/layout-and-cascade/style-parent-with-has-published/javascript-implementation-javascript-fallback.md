
```js
// 1. Initialize the generic fallback
const form = document.querySelector('#demo-form');
UserInvalidFallback.init(form);

// 2. Add specialized "parent styling" logic (Separate from fallback)
const supportsHas = CSS.supports('selector(:has(a))');
if (!supportsHas) {
  // Listen for changes to form validity after interaction
  form.addEventListener('blur', (e) => {
    if (!e.target.matches('input, select, textarea')) return;

    // Find the container we want to style (sync with CSS)
    const container = e.target.closest('.card-section');
    if (!container) return;

    // Check if ANY input in this container is invalid. Match :user-invalid as well as the
    // fallback class: a browser can support :user-invalid but not :has().
    const hasError = container.querySelector(':is(:user-invalid, .user-invalid-fallback)');
    container.classList.toggle('has-error-fallback', !!hasError);
  }, true); // Capture phase to ensure we run after the fallback's blur listener

  // Also handle input events for immediate cleanup
  form.addEventListener('input', (e) => {
    const container = e.target.closest('.card-section');
    if (container) {
      const hasError = container.querySelector(':is(:user-invalid, .user-invalid-fallback)');
      container.classList.toggle('has-error-fallback', !!hasError);
    }
  });

  // A submit attempt flags every failing field through the invalid event, the only event
  // it fires on fields the user never touched. invalid doesn't bubble, so use the capture phase.
  form.addEventListener('invalid', (e) => {
    const container = e.target.closest('.card-section');
    if (container) {
      const hasError = container.querySelector(':is(:user-invalid, .user-invalid-fallback)');
      container.classList.toggle('has-error-fallback', !!hasError);
    }
  }, true);

  // Handle form resets
  form.addEventListener('reset', () => {
    form.querySelectorAll('.has-error-fallback').forEach(el => {
      el.classList.remove('has-error-fallback');
    });
  });
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/css/style-parent-with-has.md#L174-L224). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
