#### Code Example: HTML & JavaScript: Native `<dialog>` with standard close events

```html
<!-- Dialog opens natively with showModal() and locks focus -->
<button id="open-btn">Open Dialog</button>

<dialog id="accessible-modal" aria-labelledby="title-id">
  <h2 id="title-id">Account Settings</h2>
  <p>Update your details here.</p>
  <button onclick="this.closest('dialog').close()">Close Dialog</button>
</dialog>

<script>
  document.getElementById('open-btn').addEventListener('click', () => {
    document.getElementById('accessible-modal').showModal();
  });
</script>
```

### Custom overlays

- **Use the `inert` attribute for custom overlays:** When `<dialog>` cannot be used (e.g., some non-modal overlays, framework constraints, or layouts where `<dialog>`'s top-layer/positioning behavior conflicts with the design), apply `inert` to outside content to ensure it cannot be interacted with by keyboard, pointer, or assistive technology. This requires structuring elements in such a way that the custom overlay is not a descendant of the element with `inert` set on it. (1.3.2 Meaningful Sequence (Level A), 2.4.3 Focus Order (Level A))
- **Apply `role="dialog"` to the custom overlay:** When applied to the element used as the container for the custom overlay, it ensures that it is exposed as a dialog box to assistive technologies. (4.1.2 Name, Role, Value (Level A))
- **Move focus to the overlay:** Ensure keyboard and screen reader focus moves to the container for the overlay so that people using a screen reader and people using the keyboard alone can start navigating its contents. Don't leave focus in outside content. (1.3.2 Meaningful Sequence (Level A), 2.4.3 Focus Order (Level A))

## 13. Testing Validations

### Automated checks

- **Run Automated checks via axe-core or Lighthouse audits:** Catch missing alt texts or low contrasts (e.g., via Lighthouse in Chrome DevTools MCP).
- **Don't rely purely on scores:** A 100% score does not guarantee real usability.

### Manual testing

- **Validate Sequential Navigations using keyboards alone:** Using only keyboard shortcuts, such as <kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd>, arrow keys, <kbd>Enter</kbd>, <kbd>Space</kbd>, and <kbd>Esc</kbd>, confirm every interactive element is reachable and operable, and that focus never gets stuck.
- **Test on Screen Readers with calibrated browsers:** Rely on standard bindings (e.g., JAWS with Chrome, NVDA with Firefox, Narrator with Edge, VoiceOver with Safari on macOS and iOS, TalkBack with Chrome for Android).

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/accessibility/accessibility.md#L550-L585). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
