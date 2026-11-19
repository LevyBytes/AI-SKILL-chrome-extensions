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

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/custom-button-actions/guide.md#L143-L192). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
