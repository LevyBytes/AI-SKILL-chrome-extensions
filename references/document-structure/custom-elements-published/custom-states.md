Related section: [Custom elements](overview.md).
## Custom states

Custom states are boolean flags an element exposes *about itself* for CSS to target, set through `ElementInternals` and matched with the `:state()` pseudo-class. Use them for internal, runtime UI state — `busy`, `expanded`, `invalid` — instead of reflecting a synthetic attribute: they can't collide with a consumer's attributes, never appear in the DOM, and are read-only from outside (a consumer can *style* `:state()` but can't forge it).

```javascript
class AsyncButton extends HTMLElement {
  #internals;
  #action = async () => {};

  constructor() {
    super();
    this.#internals = this.attachInternals();
  }

  set action(fn) { this.#action = fn; } // host supplies the work to run

  async run() {
    if (this.#internals.states.has('busy')) return; // guard re-entry
    this.#internals.states.add('busy');
    this.#internals.ariaBusy = 'true'; // assistive technologies don't see custom states
    this.#internals.states.delete('success');
    this.#internals.states.delete('error');
    try {
      await this.#action();
      this.#internals.states.add('success');
    } catch {
      this.#internals.states.add('error');
    } finally {
      this.#internals.states.delete('busy');
      this.#internals.ariaBusy = 'false';
    }
  }
}
```

`CustomStateSet` is a set, so independent states compose (`busy` plus `error`) without inventing a combined `data-status` enum.

Custom states only reach CSS: assistive technologies don't see them. When a state tells the user something (busy, success, error, invalid, expanded), also expose it to assistive technologies, as ARIA state through `ElementInternals` (as with `ariaBusy` above) or on the native control inside the component, show it in text rather than color alone, and announce the outcome of an action, such as a save succeeding or failing, as a status message (WCAG 4.1.2 Name, Role, Value; 1.4.1 Use of Color; 4.1.3 Status Messages).

**Custom state is runtime-only.** It is not serialized to the DOM, so it does not survive a reload, the element being re-created, or server rendering. If the state must be set declaratively in markup or persist across loads, that is a job for an **attribute** (see [Where the value lives](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/html/custom-elements.md#where-the-value-lives)) — restore it in `connectedCallback` from your source of truth. Rule of thumb: custom state for what the component derives and owns at runtime and only needs to *style*; an attribute for what must be set from markup or serialized.

For styling these states — both inside the component and from a consumer's stylesheet — see `styling-web-components` (via `npx -y modern-web-guidance@latest retrieve "styling-web-components"`).

## Naming conventions

- True-private state: native `#` fields (`#count`) for hard encapsulation; a `_` prefix only when subclasses must still reach it. Note `#` fields are not inherited — a subclass cannot see a base class's private fields.
- Symbol-keyed properties are a middle ground: hidden from ordinary enumeration, but reachable by any code holding the symbol (export it, or expose it as a `static` field on the class). Because each symbol is unique, two symbols sharing a description never collide — handy when a subclass or sibling needs controlled access that `#` fields can't provide.
- Do **not** shadow global attributes (such as `style`, `class`, `id`, `slot`, `part`, `title`, `lang`, `dir`) with your own properties, for example a `role` or `ariaLabel` class field; doing so breaks their built-in behavior, and a consumer setting the property no longer changes the attribute or what assistive technologies receive. Note `disabled` is only global on form controls; on other elements you must implement its effect yourself, including ignoring activation and exposing the state to assistive technologies (for example `this.#internals.ariaDisabled = 'true'`). If the component's styles set `display` on `:host`, also add `:host([hidden]) { display: none; }`, or the `hidden` attribute stops hiding the element and its content stays visible, focusable and in the accessibility tree.

When naming a new API surface, follow the platform's own conventions: use lowercase kebab-case with at least one hyphen for custom element tag names (for example `my-toggle`), `lowerCamelCase` for properties and methods, and lowercase attribute names synchronized with their corresponding properties.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/html/custom-elements.md#L83-L132). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
