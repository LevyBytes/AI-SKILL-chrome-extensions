# CSP & Sandboxed Code Execution

## Extension CSP Restrictions

Chrome Extensions enforce a strict Content Security Policy that cannot be relaxed for extension
pages (popup, side panel, options, new tab, etc.).

Blocked by default:
- `eval()`, `new Function()`, `setTimeout("string")`
- Inline `<script>` tags
- Inline event handlers (`onclick="..."`, `onload="..."`, etc.)
- `javascript:` URLs

## HTML Best Practices

```html
<!-- ❌ BAD: Inline script -->
<script>
  document.getElementById('btn').onclick = () => alert('hi');
</script>

<!-- ❌ BAD: Inline event handler -->
<button onclick="doThing()">Click</button>

<!-- ✅ GOOD: External script file -->
<script src="popup.js"></script>
```

In `popup.js`:
```js
document.getElementById('btn').addEventListener('click', () => {
  // Handle click
});
```

## Executing User Code (Code Playground Pattern)

If you need to execute arbitrary code (e.g., a CodePen-like playground), you MUST use one of these
approaches. **Extension CSP completely blocks `eval()`, `new Function()`, and inline scripts in
normal extension pages.** There is no way around this — you need sandboxing.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/skills-src/chrome-extensions/references/extensions/csp-sandbox.md#L1-L41). [Upstream licensing terms](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/README.md#license). Reorganized for this edition.
