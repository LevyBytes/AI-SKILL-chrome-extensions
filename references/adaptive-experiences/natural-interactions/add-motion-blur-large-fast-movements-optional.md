Related section: [Natural interactions](overview.md).
### Add motion blur to large, fast movements (optional)

For large, rapid translations (such as a full-screen sheet sliding into view), a subtle, temporary blur softens the movement. `filter` doesn't run only on the compositor, so keep blur to large, brief movements, skip it for small controls or slow transitions, and always guard it with a reduced-motion media query.

```css
@media (prefers-reduced-motion: no-preference) {
  .sheet.is-open { animation: sheet-in 300ms ease-out both; } /* example duration */
}
@keyframes sheet-in {
  from { translate: 0 100%; filter: blur(6px); } /* example blur radius */
}
```

### Make every action reachable without a mouse

- Use `<button>` for actions and `<a>` with an `href` for navigation. Both receive keyboard focus and activate on <kbd>Enter</kbd>; buttons also activate on <kbd>Space</kbd>.
- Menus and dropdowns may open on hover, but never only on hover: they also open on click, tap, and keyboard activation, stay open while the pointer moves onto them, and close with <kbd>Esc</kbd> (WCAG 2.1.1, 1.4.13).
- Controls or details revealed in place on hover, such as card actions, must also appear on keyboard focus and be visible by default on devices without hover:

```css
.card .actions {
  opacity: 0;

  .card:hover &,
  .card:focus-within & { opacity: 1; }

  @media (hover: none) { opacity: 1; }
}
```

For tooltips and previews triggered on hover, focus, or long-press, see {{ GUIDE_REF("interest-triggered-tooltips") }} and {{ GUIDE_REF("interest-triggered-action-previews") }}.

## Fallback strategies

{{ FEATURE_FALLBACKS("popover") }}

### Anchor positioning

{{ BASELINE_STATUS("anchor-positioning", "html.elements.button.popovertarget.implicit_anchor_reference") }}

Without support, `inset: auto` leaves the popover at the top-left corner of the viewport. When `CSS.supports('position-area: bottom')` is false, set the popover's `top` and `left` from the trigger's `getBoundingClientRect()` in a `beforetoggle` event listener.

### Linear easing

{{ BASELINE_STATUS("linear-easing") }}

Browsers without `linear()` drop the declaration that uses it, so precede it with one that uses a keyword such as `ease-out`, as the fade-in above does. Write `linear()` inline, not through a custom property, or the earlier declaration is discarded too.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/user-experience/natural-interactions/guide.md#L90-L136). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
