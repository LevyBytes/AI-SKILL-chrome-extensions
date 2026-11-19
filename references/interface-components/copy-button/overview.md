```yaml
---
name: copy-button
description: Build a copy button that copies text from arbitrary elements to the clipboard.
web-feature-ids:
  - invoker-commands
  - async-clipboard
  - popover
  - prefers-reduced-motion
  - logical-properties
  - focus-within
  - interaction
guides:
  - icons
---
```

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
- Render the icon with whatever the codebase uses for icons (see {{ GUIDE_REF("icons") }}) and mark it decorative; the button's accessible name comes from `aria-label`, not the icon.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/copy-button/guide.md#L1-L43). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
