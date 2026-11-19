Related section: [state(): style the component's own states](state-style-component-s-own-states.md).
# Styling Web Components

Shadow DOM is a style boundary: page rules don't reach in and component rules don't leak out, except **inherited** properties (including custom properties). Cross it deliberately through the channels below.

## `:host`, `:host()`, `:host-context()`

```css
/* The component's own host element, styled from inside its shadow tree. */
:host { display: block; }

/* Only when the host matches a selector (e.g. a reflected state attribute). */
:host([disabled]) { opacity: 0.5; pointer-events: none; }

/* Based on an ancestor in the Light DOM; useful for theming. */
:host-context([theme="dark"]) { background: #111; color: #eee; }
```

**Avoid `:host-context()`.** It reaches *outside* the boundary to test ancestors, but Firefox and Safari have declined to ship it and the CSSWG is leaning toward not developing it further — treat it as a Chromium-only dead end, not a forward-looking option. Theme through an inherited CSS custom property instead (below): the consumer sets the property on an ancestor and the component reads it across the boundary, which works everywhere and keeps both sides decoupled.

## Inherited properties and custom properties cross the boundary

Inherited CSS properties (`color`, `font-family`, `line-height`, and CSS custom properties) **do** pass through the shadow boundary. This makes custom properties the primary theming API: expose them with sensible fallbacks.

```css
:host {
  /* Consumers override --card-bg from outside; the fallback keeps it usable. */
  background: var(--card-bg, white);
  color: var(--card-fg, black);
}
```

A custom property *defined* on `:host` can only be overridden by rules targeting the host element specifically. To let it inherit and be overridable from anywhere up the tree, leave the public property unset on `:host` and rely on the fallback in each `var()`; do not seed the public property on `:host`.

To keep the fallback declared once rather than repeated at every `var()`, define a private "shadow" property on `:host` that reads the public one, and reference the private property internally:

```css
:host {
  --_card-bg: var(--card-bg, white);
  --_card-fg: var(--card-fg, black);
}
.card { background: var(--_card-bg); color: var(--_card-fg); }
```

Consumers still override `--card-bg` from outside; the leading underscore signals the alias is internal, and the fallback lives in exactly one place.

## `::slotted()`: styling projected Light DOM

`::slotted(selector)` targets the **top-level** nodes assigned to a slot. It cannot reach their descendants, and it loses to any Light DOM rule (the consumer owns their own content), so use it for light touch-ups, not control. `::slotted(...) !important` can beat consumer rules, but doing so overrides styling the consumer is entitled to own — reserve it for structural fixes, not aesthetic overrides.

```css
/* Matches a slotted <p>, but NOT a <p> nested inside a slotted <div>. */
::slotted(p) { margin: 0; }
```

## `::part()` and `exportparts`: expose internals for theming

Mark an internal element with `part="name"` to let consumers style it with any property, without learning your internal structure.

```html
<!-- inside the shadow template -->
<button part="submit">Submit</button>
```

```css
/* consumer stylesheet */
my-card::part(submit) { background: navy; color: white; }
```

Expose a few **high-level** parts (button, input, label), not every `<div>`; broad part surfaces become a brittle API. To re-expose a nested component's parts upward through your own component, forward them with `exportparts`:

```html
<inner-widget exportparts="submit: card-submit"></inner-widget>
```

Choose between the two channels deliberately: **custom properties** for a constrained, design-system-safe set of values; **parts** for unrestricted styling of a specific element.

## Forwarding styles to a wrapped native element

When a custom element wraps a native control (`<my-button>` around a real `<button>`), three things routinely trip people up:

- **Form controls don't inherit typography.** `color` and custom properties cross the boundary, but `<button>`, `<input>`, and `<select>` take `font` and friends from the UA stylesheet, which does *not* inherit. The wrapped control therefore renders in the platform font, not the page font, until you set `font: inherit` (and usually `color: inherit`) on it inside the shadow tree. This is the single most common miss.
- **`:host` styles don't reach the inner element.** Setting `background`/`border`/`padding` on `:host` styles the host box, not the control inside it. Forward deliberately: expose the control as a `::part` for open-ended styling, or pipe a fixed set of values through custom properties — a `:host` rule does not cascade into the wrapped element.
- **`display: contents` + `all: inherit` is a real tradeoff, not a shortcut.** Collapsing the host with `display: contents` and resetting the inner control with `all: inherit` is currently the only generic way to pass arbitrary styles through to a wrapped native element without consumers learning per-component parts or custom properties — and removing the host's own box is usually *the point* of the pattern (composition compensating for a missing built-in inheritance). Two real caveats: `all: inherit` wipes UA defaults, so scope to specific properties or use `revert` when you want defaults back; and the concrete blocker — `getBoundingClientRect()` and `getClientRects()` return zero for `display: contents` elements, so anchor positioning against the host is broken. Reach for `::part` or custom properties when those tradeoffs don't fit.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/html/styling-web-components.md#L1-L84). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
