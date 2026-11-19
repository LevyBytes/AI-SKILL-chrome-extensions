# Copy button

Build a button that copies the text of another element (code block, inline value, read-only field) or the current selection. Declare the target with Invoker Commands (`command` + `commandfor`) instead of per-button JavaScript wiring, and write with the Async Clipboard API.

## Implementation

### 1. Markup

```html
<!-- Custom commands MUST start with "--". commandfor is the id of the element whose text is copied. -->
<span class="copy"> <!-- positioning context for the bubble -->
  <!-- aria-label names the content being copied; several bare "Copy" buttons are indistinguishable to screen readers -->
  <button type="button" class="copy-button" command="--copy" commandfor="snippet" aria-label="Copy CSS code">
    <!-- Decorative icon, rendered however the codebase renders icons -->
    <span class="icon" aria-hidden="true"></span>
  </button>
  <!-- The confirmation bubble IS the live region. Keep it empty until a copy, and outside the button:
       a button's children are presentational, so a live region inside one is not reliably announced -->
  <span class="tip" role="status"></span>
</span>
<pre><code id="snippet">…</code></pre>
```

- Use `type="button"` so the button never submits a form.
- Size the button at least 24×24 CSS px with `min-inline-size`/`min-block-size` (not `inline-size`/`block-size`), so content can grow the target but never shrink it.
- Name an icon-only button with `aria-label`. If the button shows visible text, that text is the name; do not add an `aria-label` that differs from it.
- Render the icon with whatever the codebase uses for icons (see `icons` (via `npx -y modern-web-guidance@latest retrieve "icons"`)) and mark it decorative; the button's accessible name comes from `aria-label`, not the icon.

### 2. Copying logic

Put the copy logic in one function so the native and fallback paths share it.

```js
let selectedText = ''; // set by the optional selection popover (step 3)

async function copy(button, target, command = '--copy') {
  // Form controls expose text via .value; innerText (unlike textContent) keeps rendered line breaks
  const text = command === '--copy-selection'
    ? selectedText
    : target.matches('input, textarea') ? target.value : target.innerText.trim();
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    report(button, true); // see Feedback below
  } catch {
    report(button, false); // clipboard access can be denied: show the failure too, not only announce it
  }
}

// `command` events do not bubble: listen in the capture phase on document.
// event.source is the clicked button; event.target is the commandfor element.
document.addEventListener('command', (event) => {
  if (event.command.startsWith('--copy')) copy(event.source, event.target, event.command);
}, true);
```

- **One element for sighted and screen reader users:** `report()` sets `data-copied` (or `data-failed`) on the button and writes the message into the bubble, which is both the visible feedback and the live region. Sighted and screen reader users then get the same message for both outcomes. Keep messages short ("Copied", "Copy failed").
- **Show and hide the bubble with `opacity`,** not `display: none` or `visibility: hidden`, which take it out of the accessibility tree so the text is not announced.
- **Clean up:** after a short timeout, remove the state attributes and clear the bubble's text, so no stale "Copied" is left for screen reader browse mode.
- **Not color alone:** swap the icon (copy to check) on success and use the bubble text for both outcomes.
- **Repeat clicks:** clear the pending timeout and restart the animation instead of stacking timers. DO NOT disable the button while showing feedback: copying is idempotent, and disabling drops keyboard focus, announces a misleading unavailable state, and blocks retrying after a failure.
- **Reduced motion:** under `prefers-reduced-motion: reduce`, replace icon and bubble animations with an opacity fade.

```js
const timers = new WeakMap();

function report(button, ok) {
  const tip = button.nextElementSibling; // the role="status" bubble
  clearTimeout(timers.get(button));
  button.removeAttribute('data-copied');
  button.removeAttribute('data-failed');
  const message = ok ? 'Copied' : 'Copy failed';
  tip.textContent = '';
  void button.offsetWidth; // restart the CSS animation
  button.setAttribute(ok ? 'data-copied' : 'data-failed', '');
  requestAnimationFrame(() => (tip.textContent = message));
  timers.set(button, setTimeout(() => { // 2000ms is an example value
    button.removeAttribute('data-copied');
    button.removeAttribute('data-failed');
    tip.textContent = '';
  }, 2000));
}
```

### 3. Copy the current selection (optional)

Add this only for long prose where users want a floating button on selection. Skip it for code blocks, inline values, and fields.

- Use a `popover="manual"` element (not light-dismissed, so the selection survives) containing a button with `command="--copy-selection" commandfor="<container id>"`.
- Show it on `selectionchange` (debounced; wait for `pointerup` while dragging) only when the selection is non-collapsed and inside the container. A triple-click ends at the start of the next element, so do not require the end node to be inside: clip the range's end to the container and accept it when the clipped text equals the selected text. Copy and position from the clipped range, using its `getBoundingClientRect()`: centered on the inline axis and above the selection on the block axis, so it never covers selected text. Only enable the popover when `matchMedia('(pointer: fine)').matches`: touch browsers already offer Copy in their native selection menu, which the popover would duplicate and collide with.
- Assign the selected text to `selectedText` when showing the popover; `copy()` reads that saved string for `--copy-selection`; interacting with the button can collapse the live selection.
- Call `preventDefault()` on the popover's `pointerdown` to keep the selection. This also stops the button from taking focus on click or tap, so `:focus-within` cannot tell you that a press is in progress. Set a flag on the popover's `pointerdown` and, while it is set, do not hide the popover even if the selection collapses (some touch browsers clear it anyway). Clear the flag and re-check when the copy feedback ends (and on `pointercancel`). Otherwise, hide it on `Escape`, and when the selection collapses unless keyboard focus is inside the popover (re-check when focus leaves it).
- DO NOT hide the popover when the copy feedback timeout ends: a keyboard user's focus is on its button, and hiding it drops focus to the page, so the next `Tab` starts from the top. If `Escape` hides it while focus is inside, first move focus to the container: set `tabindex="-1"` on it just before the move and remove it on `blur`. Do not leave it in the markup, because a focusable container makes `Tab` skip the copy button in Firefox after a click in the text.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/copy-button.md#L1-L94). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
