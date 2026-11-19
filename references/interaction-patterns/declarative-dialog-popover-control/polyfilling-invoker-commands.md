Related section: [Declarative dialog popover control](overview.md).
### Polyfilling Invoker Commands

MANDATORY: Feature detect support by checking for the `commandForElement` property on the `HTMLButtonElement` prototype. Do NOT check the window or document object. You MUST dynamically import the polyfill only when the native feature is missing. DO NOT unconditionally load the polyfill.
Mandatory: Listen for the 'command' event directly on the target element because the native 'command' event does not bubble.

**Option 1: Using a bundler**
Install the polyfill via npm (`npm install invokers-polyfill`). This approach is for projects using a bundler (like Vite or Webpack) or import maps. For all other setups, use the CDN option below.

```javascript
// MANDATORY: Feature detect 'commandForElement' on HTMLButtonElement.prototype.
// Conditionally load the invokers-polyfill only in browsers lacking native support.
if (!('commandForElement' in HTMLButtonElement.prototype)) {
  import('invokers-polyfill');
}
```

**Option 2: Using a CDN**
For projects without a bundler, dynamically import the polyfill directly from a CDN inside a `<script type="module">`.

```html
<script type="module">
  // MANDATORY: Feature detect 'commandForElement' on HTMLButtonElement.prototype.
  // Conditionally load the invokers-polyfill from a CDN only in browsers lacking native support.
  if (!('commandForElement' in HTMLButtonElement.prototype)) {
    import('https://esm.run/invokers-polyfill');
  }
</script>
```

**Invokers Polyfill Limitations**
MANDATORY: This polyfill does not handle the ARIA states (e.g., `aria-expanded`) of the command button the way native browsers do. You are strongly encouraged to handle these states yourself to ensure your site is fully accessible.

{{ INCLUDE("../custom-button-actions/guide.md#manually-manage-aria-states-in-your-listener") }}

{{ FEATURE_FALLBACKS("popover") }}

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/declarative-dialog-popover-control/guide.md#L87-L121). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
