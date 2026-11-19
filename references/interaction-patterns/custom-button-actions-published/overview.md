Related section: [Dynamic Import (Performance Optimization)](dynamic-import-performance-optimization.md).
# Custom Button Actions
The Invoker Commands API allows buttons to trigger actions on target elements declaratively using HTML attributes. 
This approach reduces the need for manual event listeners and decouples the UI from implementation details.
For custom, application-specific actions, you can define your own command names. Custom commands must be prefixed with a double dash (`--`) to avoid collisions with future built-in browser commands.

## Implementation steps

1.  **Define the target element**: Identify the element that will respond to the action. If it doesn’t have a unique `id`, add one.
2.  **Configure the invoker button**: Use the `commandfor` attribute to point to the target's `id`, and the `command` attribute to specify the custom command name (prefixed with `--`).
3.  **Handle the command event**: Attach a `command` event listener directly on the target element. The event object contains a `command` property and a `target` property (referring to the element identified by `commandfor`).
4.  **Handle aria states**: Custom commands do not have inherent semantics, and you must handle states like `aria-pressed` or `aria-expanded`.

## Example: Custom Animation Controls

```html
<!-- The target element that will respond to custom commands -->
<div id="action-target" class="target">
  Action Target
</div>

<!-- Buttons declaratively linked to the target element -->
<!-- Each button sends a unique custom command starting with '--' -->
<button commandfor="action-target" command="--spin">
  Spin
</button>

<button commandfor="action-target" command="--grow">
  Grow
</button>

<button commandfor="action-target" command="--reset">
  Reset All
</button>

<script>
  // 1. **Optional:** Define a registry of requested actions for cleaner logic
const commandRegistry = {
  '--spin': (target, source) => {
    const isSpun = target.classList.toggle('is-spun');
    // Set ARIA states, as custom commands have no inherent semantics.
    source?.setAttribute('aria-pressed', isSpun);
  },
  '--grow': (target, source) => {
    const isGrown = target.classList.toggle('is-grown');
    source?.setAttribute('aria-pressed', isGrown);
  },
  '--reset': (target) => {
    target.classList.remove('is-spun', 'is-grown');
    // Reset all associated buttons' ARIA states
    document.querySelectorAll(`button[commandfor="${target.id}"]`).forEach(btn => {
      btn.setAttribute('aria-pressed', 'false');
    });
  },
};

  // 2. **Mandatory:** Listen for the 'command' event directly on the target element
  // (This is necessary because the native 'command' event does not bubble)
  document.getElementById('action-target').addEventListener('command', (event) => {
    const command = event.command;
    const target = event.target;
    const source = event.source; // event.source refers to the triggering button
    const action = commandRegistry[command];

    if (action) {
      action(target, source);
    }
  });
</script>
```

## Key constraints

*   **Prefix custom commands**: MANDATORY: All custom command names must start with `--` (e.g., `command="--my-action"`).
*   **Targeting**: The `commandfor` attribute must match the `id` of an element in the same document tree.
*   **No bubbling**: The `command` event does not bubble. If there multiple possible targets, add `{ capture: true }` to the event handler and listen on an ancestor.
*   **Shadow roots**: If the target may be in a shadow root, use `event.composedPath()[0]` instead of `event.target`.
*   **Accessibility**: Custom commands have no inherent semantics, and you must explicitly apply any states.

## Accessibility considerations

* If the button displays additional content, use the `aria-expanded` attribute, set to `aria-expanded="false"` by default and `aria-expanded="true"` when the accompanying content is displayed
* If the button facilitates an interaction itself (examples include toggle buttons which can play and pause, volume buttons which can mute and unmute), use the `aria-pressed` attribute, set to `aria-pressed="false"` when inactive, and `aria-pressed="true"` when active
* If the button opens an element with a role of either `menu`, `listbox`, `tree`, `grid`, or `dialog`, then the control must have an `aria-haspopup` attribute, with a value set to the role of the element that it opens
* If the button becomes disabled on activation, instead of using `disabled`, use `aria-disabled="true"` so that there is no loss of focus

## Fallback strategies

Baseline status for Invoker commands: Newly available. It's been Baseline since 2025-12-12.
Supported by: Chrome 135 (Apr 2025), Edge 135 (Apr 2025), Firefox 144 (Oct 2025), and Safari 26.2 (Dec 2025).

If the Invoker Commands API is not supported, the `command` event will not fire. For full support across all modern browsers, it is recommended to use the invokers-polyfill from https://github.com/keithamus/invokers-polyfill via `npm install` or CDN.

This polyfill fully supports custom actions (starting with `--`) and dispatches the `command` event exactly like the native API.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/custom-button-actions.md#L1-L94). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
