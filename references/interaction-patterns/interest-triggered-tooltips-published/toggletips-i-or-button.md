## Toggletips: an "i" or "?" button

Give a toggletip both triggers: `interestfor` opens it on hover, focus, and long-press; `popovertarget` opens it on click, tap, and `Enter`.

```html
<label>Shipping <input name="shipping"></label>
<!-- The name says what the button reveals; the "?" alone is not a name. -->
<button type="button" interestfor="shipping-help" popovertarget="shipping-help" popovertargetaction="show" aria-label="More about shipping">?</button>
<!-- Right after the trigger, so it reads in sequence. -->
<div id="shipping-help" popover="hint">Free shipping applies to orders over $50. Orders placed before 2pm ship the same day.</div>
```

- Use `popovertargetaction="show"`, not the default `toggle`: hover has usually opened the popover already, and a toggle would close it on the click that follows. `Escape`, light dismiss, and losing interest close it.
- Keep `popover="hint"`: hovering across a toggletip must not close an open menu, which an `auto` popover would.
- Position it like any tooltip. The button is the popover's implicit anchor through either attribute.

## Fallback strategies

### Fallbacks & browser support for Interest invokers

Browser support for Interest invokers: Limited availability.
Supported by: Chrome 149 (Jun 2026) and Edge 149 (Jun 2026).
Unsupported in: Firefox and Safari.

Interest invokers must be conditionally polyfilled using the `interestfor` polyfill package from NPM. Prefer bundling the polyfill over using the CDN.

**MANDATORY:** Feature detect by checking for the `interestForElement` property on `HTMLButtonElement.prototype`, and load the polyfill **only** when native support is missing.

```html
<script type="module">
  if (!("interestForElement" in HTMLButtonElement.prototype)) {
    // CDN link only used for example, prefer bundling.
    await import("https://unpkg.com/interestfor@latest");
  }
</script>
```

### CSS Polyfill Caveats

When using the polyfill, the CSS API changes slightly to account for the lack of native pseudo-class and property support:

- **Pseudo-classes:** The polyfill cannot define real `:interest-source` and `:interest-target` pseudo-classes, so it applies `.interest-source` and `.interest-target` classes instead. **MANDATORY:** Combine them with `:is()` to support both native and polyfilled states.

```css
/* Styles to apply when the effect is being previewed */
:is(:interest-source, .interest-source) { /* ... */ }
:is(:interest-target, .interest-target) { /* ... */ }
```

- **CSS Properties:** For `interest-delay`, `interest-delay-start`, and `interest-delay-end`, the polyfill requires using CSS variables as it cannot read the custom properties directly in all browsers.

```css
/* Adjust the start and end delay for interest invokers */
[interestfor] {
  --interest-delay-start: 0.2s;
  interest-delay-start: var(--interest-delay-start);
  --interest-delay-end: 0.1s;
  interest-delay-end: var(--interest-delay-end);
}
```

Set the initial delay to `0s` if an interest-triggered popover is already open and users are likely to move through multiple triggers in quick succession.

```css
.container:has([interestfor]:is(:interest-source, .interest-source)) [interestfor] {
  --interest-delay-start: 0s;
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/interest-triggered-tooltips.md#L93-L161). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
