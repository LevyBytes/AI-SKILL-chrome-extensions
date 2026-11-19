Related section: [Styling web components](overview.md).
## `:state()`: style the component's own states

A custom element can expose internal boolean states through `ElementInternals` via `this.#internals.states.add('busy')` and `.delete('busy')` (see `custom-elements` (via `npx -y modern-web-guidance@latest retrieve "custom-elements"`) for lifecycle usage), and those states become a styling channel across the boundary — like `::part` and custom properties, but for *state* rather than structure or values. Match them inside the shadow tree with `:host(:state(name))`, and from a consumer's stylesheet with `tag-name:state(name)`:

```css
/* Inside the component's shadow tree. */
:host(:state(busy)) button { opacity: 0.6; pointer-events: none; }

/* From the consumer's stylesheet — a read-only public hook. */
favorite-button:state(favorited) { filter: drop-shadow(0 0 4px crimson); }
```

Unlike a reflected attribute, a custom state is **read-only to the outside**: consumers can style it but cannot set or forge it, so the component stays the sole writer. Prefer it over a `data-*` attribute whenever the state is owned by the component and only needs to be styled.

## `@layer` and container queries inside components

- **Cascade layers** (`@layer`) work inside a shadow root and are scoped to it; a layer name in the shadow tree is independent of a same-named layer in the page. Use them to order your own component styles (e.g. `@layer base, theme;`) so consumer overrides via custom properties and `::part` still win predictably.
- **Container queries** are the right tool for responsive components: a component should respond to the space it's given, not the viewport. Declare the host or a wrapper as a container (giving `:host` a layout box such as `display: block`, since custom elements default to `display: inline` and size containment does not apply to `inline` or `contents` elements) and query it, so the same component adapts in a sidebar or a full-width region.

```css
:host {
  display: block; /* Required: size containment does not apply to default display: inline */
  container-type: inline-size;
}

@container (min-width: 30rem) {
  .card { grid-template-columns: 1fr 2fr; }
}
```

## Fallback strategies

Baseline status for Shadow parts: Widely available. It's been Baseline since 2020-07-28.
Supported by: Chrome 73 (Mar 2019), Edge 79 (Jan 2020), Firefox 72 (Jan 2020), Safari 13.1 (Mar 2020), and Safari iOS 13.4 (Mar 2020).

Baseline status for Cascade layers: Widely available. It's been Baseline since 2022-03-14.
Supported by: Chrome 99 (Mar 2022), Edge 99 (Mar 2022), Firefox 97 (Feb 2022), and Safari 15.4 (Mar 2022).

Baseline status for Container queries (size): Widely available. It's been Baseline since 2023-02-14.
Supported by: Chrome 105 (Sep 2022), Edge 105 (Sep 2022), Firefox 110 (Feb 2023), and Safari 16 (Sep 2022).

Browser support for :host-context(): Limited availability.
Supported by: Chrome 54 (Oct 2016) and Edge 79 (Jan 2020).
Unsupported in: Firefox and Safari.

`::part`, cascade layers, and container queries are broadly available; theme primarily through inherited custom properties, which work even where these don't. As noted above, do **not** rely on `:host-context()` — it is effectively Chromium-only and not a forward-looking option.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/html/styling-web-components.md#L85-L130). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
