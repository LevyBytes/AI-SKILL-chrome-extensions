## Fallbacks and browser support

### Invoker Commands

{{ BASELINE_STATUS("invoker-commands") }}

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

{{ BASELINE_STATUS("async-clipboard", "api.Clipboard.writeText") }}

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

{{ FEATURE_FALLBACKS("popover") }}

### Repeated announcements (VoiceOver)

VoiceOver skips a message identical to the previous one from the same region, even if the region was emptied in between. Track the last message in a variable (not by reading the bubble, which is cleared) and, when a message repeats, append a no-break space (`\u00A0`) so it differs. It is not read aloud. One page-wide value is the simplest way to track it: a message from another button's bubble gets the space too, which is harmless. Do not use `ariaNotify()` for this.

```js
let lastMessage = '';

// In report(), replace `const message` with `let message`, then:
if (message === lastMessage) message += '\u00A0'; // differs from the last one, so it is announced
lastMessage = message;
```

{# Maintainer note: the no-break space workaround is for a VoiceOver bug (WebKit bug 222189, rdar://74532730) and is what WordPress's a11y package does (packages/a11y/src/shared/filter-message.ts). A tester found that in Chrome and Safari TP VoiceOver does read a repeat from a different region and skips only a repeat from the same bubble, so the guide no longer claims it skips across regions. ariaNotify() was tried and rejected: missing in a Safari that should have it, and on iPhone VoiceOver read the button name over the announcement. Revisit when it is dependable. #}

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/copy-button/guide.md#L140-L205). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
