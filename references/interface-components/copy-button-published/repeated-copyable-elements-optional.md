### 4. Repeated copyable elements (optional)

When a page repeats copyable elements (code blocks, list rows, token or ID cells), a visible button on each one adds noise. Keep the button hidden until the element is hovered, reveal it for keyboard users too, and never make it hover-only.

```css
/* Touch devices (no hover): the button stays visible, so keep it in flow where it cannot cover content */
.copyable { display: flex; align-items: start; gap: .5rem; }
.copyable .copy { flex: none; order: 1; }

/* Only hide where hover exists; the overlay is then revealed on demand */
@media (hover: hover) {
  .copyable { display: block; position: relative; }
  .copyable .copy { position: absolute; inset-block-start: .5rem; inset-inline-end: .5rem; } /* .copy is the bubble's positioning context, so move it, not the button */
  .copyable .copy-button { opacity: 0; transition: opacity .15s; }
  .copyable:hover .copy-button,
  .copyable:focus-within .copy-button,
  .copyable .copy-button:focus-visible,
  .copyable .copy-button[data-copied],
  .copyable .copy-button[data-failed] { opacity: 1; }
}
```

- Hide with `opacity` only. `display: none` and `visibility: hidden` remove the button from the tab order, so keyboard users could never reach it.
- Reveal on `:focus-within` of the container, as well as `:hover`, so the button shows when focus is on it or on focusable content in the block (such as a scrollable `<pre tabindex="0">`).
- Keep it visible on `(hover: none)` devices, where there is no hover to reveal it. Lay it out in flow beside the content there so it never covers it.
- Keep it visible while feedback shows (`data-copied` / `data-failed`), so the state does not vanish when the pointer leaves.
- Keep the button's 24×24 px minimum size and its accessible name; a hidden-by-opacity button is still announced by screen readers.
- DO NOT add `aria-hidden`, `inert` or `hidden` to the button to "hide" it, and do not toggle them on hover. Screen reader users (VoiceOver included) must be able to reach it with no hover, and focus moving onto it (including a screen reader cursor that moves focus) is what makes it visible.
- Add `padding-inline-end` on the `<pre>` so the button clears the code at rest. On a horizontally scrolling `<pre>`, that padding is only reached at the end of the scroll range, so long lines can pass under the button while scrolling. Give the button a mostly opaque background and a visible border so it stays legible over code, rather than reserving a permanent margin that narrows the code area on small screens.

## Fallbacks and browser support

### Invoker Commands

Baseline status for Invoker commands: Newly available. It's been Baseline since 2025-12-12.
Supported by: Chrome 135 (Apr 2025), Edge 135 (Apr 2025), Firefox 144 (Oct 2025), and Safari 26.2 (Dec 2025).

If your Baseline target does not include Invoker Commands, keep the same markup and add a click listener that calls the same `copy()` function. This is a short, robust fallback (progressive enhancement of the same experience):

```js
// Detect on the interface, not an instance
if (!('CommandEvent' in window)) {
  // Resolve the target from commandfor, as the browser does for command events
  document.addEventListener('click', (event) => {
    const button = event.target.closest('button[command^="--copy"]');
    if (!button) return;
    const target = document.getElementById(button.getAttribute('commandfor'));
    if (target) copy(button, target, button.getAttribute('command')); // a missing target would throw inside copy()
  });
}
```

Register only one of the two paths so a click never copies twice.

### Async Clipboard

Baseline status for the api.Clipboard.writeText capability: Widely available. It's been Baseline since 2020-03-24.
Supported by: Chrome 66 (Apr 2018), Edge 79 (Jan 2020), Firefox 63 (Oct 2018), Safari 13.1 (Mar 2020), and Safari iOS 13.4 (Mar 2020).

`navigator.clipboard` is only available in secure contexts (`https:` or `localhost`), and the write is rejected when permission is denied. `copy()` already covers both: a missing `navigator.clipboard` throws inside the `try`, so the failure message is shown and announced. Serve the page over HTTPS: that is the real fix.

Only as a last resort, when you cannot control the protocol of the host page (for example a component embedded on third-party sites), fall back to the deprecated `document.execCommand('copy')` so copying still works for the user. It must run synchronously inside the user's click handler, so use it only when `navigator.clipboard` is missing or the write rejects:

```js
function legacyCopy(text) {
  const field = Object.assign(document.createElement('textarea'), { value: text });
  field.setAttribute('readonly', '');
  field.style.cssText = 'position:fixed;inset-block-start:0;opacity:0';
  document.body.append(field);
  field.select();
  try { return document.execCommand('copy'); } finally { field.remove(); }
}

// In copy(), replace the plain write with:
try {
  await navigator.clipboard.writeText(text);
} catch {
  if (!legacyCopy(text)) throw new Error('Copy failed'); // reaches the existing failure path
}
```

Only the optional selection button (step 3) uses Popover.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/copy-button.md#L95-L177). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
