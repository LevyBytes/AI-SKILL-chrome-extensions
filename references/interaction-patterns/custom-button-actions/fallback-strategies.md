## Fallback strategies

{{ BASELINE_STATUS("invoker-commands") }}

If the Invoker Commands API is not supported, the `command` event will not fire. For full support across all modern browsers, it is recommended to use the invokers-polyfill from https://github.com/keithamus/invokers-polyfill via `npm install` or CDN.

This polyfill fully supports custom actions (starting with `--`) and dispatches the `command` event exactly like the native API.

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


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/custom-button-actions/guide.md#L93-L142). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
