Related section: [Styling web components](overview.md).
## `:state()`: style the component's own states

A custom element can expose internal boolean states through `ElementInternals` via `this.#internals.states.add('busy')` and `.delete('busy')` (see {{ GUIDE_REF("custom-elements") }} for lifecycle usage), and those states become a styling channel across the boundary — like `::part` and custom properties, but for *state* rather than structure or values. Match them inside the shadow tree with `:host(:state(name))`, and from a consumer's stylesheet with `tag-name:state(name)`:

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

{{ BASELINE_STATUS("shadow-parts") }}

{{ BASELINE_STATUS("cascade-layers") }}

{{ BASELINE_STATUS("container-queries") }}

{{ BASELINE_STATUS("host-context") }}

`::part`, cascade layers, and container queries are broadly available; theme primarily through inherited custom properties, which work even where these don't. As noted above, do **not** rely on `:host-context()` — it is effectively Chromium-only and not a forward-looking option.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/html/styling-web-components/guide.md#L95-L135). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
