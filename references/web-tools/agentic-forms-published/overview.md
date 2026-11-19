Related section: [Visual Feedback (CSS)](visual-feedback-css.md).
# Agentic Forms

The Declarative API transforms standard HTML `<form>` elements into WebMCP tools via attributes. The browser synthesizes a JSON Schema from the form inputs and handles agent interactions.

**Angular Signal Forms:** **DO NOT** add `toolname`/`tooldescription` to forms built with `form()` from `@angular/forms/signals`. Instead, add `provideExperimentalWebMcpForms()` to the app providers and pass the `experimentalWebMcpTool: { name, description }` option to `form()`. Angular then registers the form through the Imperative API, building the schema from the signal model and wiring it to validation and submission. Using both approaches registers the same form twice.

## Form Attributes

*   `toolname`: Unique name for the tool.
*   `tooldescription`: What the tool does and when an agent should use it. Do not list the form's fields, options, or limits: the browser already includes them in the schema it builds from the form controls.
*   `toolautosubmit`: (Optional) If present, the agent can submit the form without waiting for user interaction. 
*   `toolparamdescription`: (Optional) Provides a way to define a property description within the JSON Schema. Use it to explain what the value means (for example, with sample values), not to repeat the control's options or limits.
    *   **Resolution Order**: The browser uses `toolparamdescription` if present. In its absence, it uses the `textContent` of the associated `<label>` (skipping labelable descendants). If no label exists, it falls back to the `aria-description`.
    *   **Grouping (Fieldsets)**: To attach a description to a group of related elements (like `<input type="radio">` buttons), place `toolparamdescription` on the nearest parent `<fieldset>` element so it applies to the parameter group as a whole.

### Example

```html
<form toolname="search-cars" 
      tooldescription="Perform a car make/model search" 
      toolautosubmit>
  <label for="make">Vehicle Make</label>
  <input type="text" id="make" name="make" required>
  
  <label for="model">Vehicle Model</label>
  <input type="text" id="model" name="model" toolparamdescription="e.g., 330i, F-150" required>
  
  <button type="submit">Search</button>
</form>
```

## Handling Submissions in JavaScript

When an agent submits the form, the `SubmitEvent` includes `agentInvoked` (boolean) and `respondWith(promise)`.

```javascript
document.querySelector('form').addEventListener('submit', (event) => {
  event.preventDefault();

  // Validate the form
  const formValidationErrors = myFormIsValid();

  if (formValidationErrors.length > 0) {
    if (event.agentInvoked) {
      const errorString =
        'Validation failed: ' +
        formValidationErrors
          .map((err) => `${err.field} (${err.message})`)
          .join(', ');

      event.respondWith(Promise.resolve(errorString));
    }
    return;
  }

  const resultPromise = performAsyncSearch(new FormData(event.target));

  // Return the result directly to the agent without navigation
  if (event.agentInvoked) {
    event.respondWith(resultPromise);
  }
});
```

## Lifecycle Events

`document.modelContext` emits events when agents start or stop interacting with a tool: `toolactivated` fires when tool execution starts, and `toolcancel` fires when it is canceled.

```javascript
// Starting in Chrome 156, these events are dispatched on `document.modelContext`.
// Older versions dispatch them on `window`. Feature-detect the event handler
// property to pick the right target for backward compatibility.
const targetFor = (type, listener, options) =>
  (`on${type}` in (document.modelContext ?? {}) ? document.modelContext : window)
    .addEventListener(type, listener, options);

targetFor('toolactivated', ({ toolName }) => {
  console.log(`Tool "${toolName}" started execution.`);
});

targetFor('toolcancel', ({ toolName }) => {
  console.log(`Tool "${toolName}" execution is cancelled.`);
});
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/webmcp/agentic-forms.md#L1-L85). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
