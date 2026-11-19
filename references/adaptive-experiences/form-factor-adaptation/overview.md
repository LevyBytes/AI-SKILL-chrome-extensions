Related section: [Label icon-only buttons](label-icon-only-buttons.md).
```yaml
---
name: form-factor-adaptation
description: Adapt layouts, controls, and text to any device or container so touch targets stay usable, content fits its space, and nothing collides with system UI.
web-feature-ids:
  - container-queries
  - safe-area-inset
  - text-wrap-balance
  - text-wrap-pretty
  - interaction
  - has
---
```

# Adapt to the form factor

The same interface runs on phones, laptops, and foldables, with touch, mouse, or keyboard. Size controls for the input, let components adapt to their container, and keep text and controls clear of system UI.

For page-level responsive techniques (dynamic viewport units, aspect ratios, and fluid type), see {{ GUIDE_REF("responsive-design") }}.

## Implementation

### Size targets for the input method

Make every control at least 24×24 CSS pixels (WCAG 2.5.8), and at least 44×44 on touch screens, where a fingertip is less precise than a mouse pointer (WCAG 2.5.5). Links inside sentences are exempt. For checkboxes and radios, wrap the input in its `<label>` and size the label. To keep small icons visually compact, extend their hit area with a pseudo-element. Leave enough space around controls so extended hit areas do not overlap each other or reach past the edge of the screen.

```css
:root { --target-size: 24px; }
@media (pointer: coarse) {
  :root { --target-size: 44px; }
}
:where(button, select, textarea, input:not([type="checkbox"], [type="radio"]), [role="button"], nav a, label:has(input[type="checkbox"], input[type="radio"])) {
  min-block-size: var(--target-size);
  min-inline-size: var(--target-size);
}
:where([role="button"], nav a, label:has(input[type="checkbox"], input[type="radio"])) { display: inline-flex; align-items: center; }
.icon-button { position: relative; }
.icon-button::after {
  content: "";
  position: absolute;
  inset: -10px;
}
```

### Let components respond to their container

Use container queries instead of viewport-width media queries for component layout, so a component adapts wherever it is placed. Keep media queries for what a container can't know: the input device (such as `pointer: coarse` for touch screens) and user settings (such as `prefers-color-scheme`).

```css
.product-list {
  /* Name containers so queries inside nested containers target the right ancestor. */
  container: products / inline-size;
}
/* A container query styles the container's descendants, never the container itself. */
@container products (inline-size > 40rem) {
  .product-card { display: grid; grid-template-columns: 10rem 1fr; }
}
```

DO NOT query `height` or `block-size` on an `inline-size` container: it measures only width. Use `container-type: size` only on a container with a definite height.

- For more container query patterns, such as card layouts, see {{ GUIDE_REF("size-aware-styling") }}.
- To change a component's layout based on what child elements it contains (for example, switching a card to a side-by-side layout when it includes an image), see {{ GUIDE_REF("content-based-styling") }}.

### Keep UI clear of notches and system bars

When drawing edge to edge with `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`, pad fixed and edge-anchored UI by the safe-area insets.

```css
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding-bottom: max(0.75rem, env(safe-area-inset-bottom, 0px));
  padding-left: max(0.75rem, env(safe-area-inset-left, 0px));
  padding-right: max(0.75rem, env(safe-area-inset-right, 0px));
}
```

Pad UI anchored to the top edge the same way with `safe-area-inset-top`.

Fixed bars cover the content that scrolls under them, so a focused element can end up hidden behind one. Set `scroll-padding-bottom` (or `scroll-padding-top` for a top bar) on the scroll container to at least the bar's height, including its safe-area padding, so the browser scrolls focused elements clear of the bar (WCAG 2.4.11 Focus Not Obscured (Minimum) requires a focused element to be at least partly visible).

```css
html {
  scroll-padding-bottom: calc(3.5rem + env(safe-area-inset-bottom, 0px));
}
```

### Balance headings and prettify body text

Apply `text-wrap: balance` to short headings (`h1, h2, h3`) and `text-wrap: pretty` to body text (`p, li`) to prevent typographic orphans. For full text-wrapping rules, see {{ GUIDE_REF("improve-text-layout-and-legibility") }}. DO NOT apply either property to `*`: both incur layout overhead, and `balance` only helps short blocks of text.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/user-experience/form-factor-adaptation/guide.md#L1-L92). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
