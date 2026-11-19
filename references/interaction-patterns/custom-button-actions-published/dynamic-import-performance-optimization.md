Related section: [Custom button actions](overview.md).
### Dynamic Import (Performance Optimization)

For the best performance, you should only load the polyfill if the browser doesn't support the API natively. This saves bandwidth and reduces script execution time for users on modern browsers.

**NOTE:** This polyfill does not manage ARIA states (like `aria-pressed` or `aria-expanded`) for custom commands. You must manually synchronize these states in your event listener to ensure your site is accessible.

#### Conditionally load the Invoker Commands polyfill

```javascript
// 1. Conditionally load the polyfill
const hasNativeSupport = 'commandForElement' in HTMLButtonElement.prototype;

if (!hasNativeSupport) {
  // Wrap in an async IIFE to avoid top-level await issues in older browsers
  (async () => {
    try {
      await import('https://esm.run/invokers-polyfill');
    } catch (err) {
      console.error('Error loading fallback:', err);
    }
  })();
}
```

#### Manually manage ARIA states in your listener

```javascript
// 2. Manually manage ARIA states in your listener
document.getElementById('action-target').addEventListener('command', (event) => {
  const command = event.command;
  const target = event.target;
  const source = event.source; // The button that triggered the command

  if (command === '--spin') {
    const isSpun = target.classList.toggle('is-spun');
    
    // Polyfill tip: Manually update ARIA to match the new state
    source?.setAttribute('aria-pressed', isSpun);
  }
});
```

### Manual fallback (Traditional pattern)

If you prefer not to use a polyfill, you can use a combination of **event delegation** to dispatch events and a **command registry** to handle the actions. This is a common architectural pattern in traditional JavaScript development that remains highly efficient and scalable.

```javascript
// 1. **Optional:** Define a registry of requested actions for cleaner logic
const commandRegistry = {
  '--spin': (target) => target.classList.toggle('is-spun'),
  '--grow': (target) => target.classList.toggle('is-grown'),
  '--reset': (target) => target.classList.remove('is-spun', 'is-grown'),
};

// 2. If CommandEvent doesn't exist, we assume no native support and provide the fallback
if (!globalThis.CommandEvent) {
  globalThis.CommandEvent = class CommandEvent extends Event {
    constructor(type, { source, command, ...options } = {}) {
      super(type, options);
      this.source = source;
      this.command = command;
    }
  }

// 3. The fallback: Dispatch events manually if native support is missing
  document.addEventListener('click', (event) => {
    const button = event.composedPath().find((el) => el.matches?.("button[commandfor]"));
    if (!button) return;

    const target = document.getElementById(button.getAttribute('commandfor'));
    const command = button.getAttribute('command');

    if (target && command) {
      target.dispatchEvent(new CommandEvent('command', { 
        command, 
        source: button,
      }));
    }
  });
}

// 4. **Mandatory:** Register the unified listener directly on the target element
document.getElementById('action-target').addEventListener('command', (event) => {
  const command = event.command;
  const target = event.target;
  const action = commandRegistry[command];

  if (action) {
    action(target);
  }
 });
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/custom-button-actions.md#L95-L186). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
