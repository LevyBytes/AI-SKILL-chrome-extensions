Related section: [Component specific light dark theme](overview.md).
### Important gotcha: Inheritance of `light-dark()` colors

**`light-dark()` resolves at computed value time.**
This means that any inherited `<color>` properties set to a `light-dark()` color will only pass down one of the two colors to their descendants, not the `light-dark()` expression itself.

This includes:
- Built-in color properties that inherit, such as `color`, `accent-color`, `fill`, `stroke`, `text-shadow`, `caret-color`
- Any registered inheritable custom properties with `syntax: <color>` and `inherits: true`
- Any other `<color>` property set to `inherit`

This means you should:
- **NOT** register custom properties meant to hold *design tokens* (e.g. `--surface-color`) as `<color>`. Tokens need to keep their `light-dark()` expression live so descendants can re-resolve them under a different `color-scheme`.
- When setting `color-scheme` on an element, re-specify any inherited `<color>` properties that may have been set to `light-dark()` values (directly or via design tokens), even if that's to the same design token.
- **NOT** use `inherit` on `<color>` properties on elements with a `color-scheme` override (fine to use on their descendants).
- **DO** use registered `<color>` properties for the *opposite* use case: when you deliberately want to snapshot the ancestor's resolved color and prevent it from re-resolving under the descendant's `color-scheme`. For example, capturing the page background to use elsewhere.
- If you need to animate a color, use a separate `@property`-registered `<color>` property on the element being animated (registration is required for color interpolation) — this is not a design token, but a per-element animation target, so it does not conflict with the rule above.

Example:

```css
:root {
	--accent-color: light-dark(blue, skyblue);
	--surface-color: light-dark(white, #222);
	--text-color: light-dark(#111, white);

	color-scheme: light dark;
	accent-color: var(--accent-color);
	color: var(--text-color);
}

body {
	/* --surface-color dynamically switches despite being inherited because --surface-color is not registered */
	background: var(--surface-color);
}

pre, code {
	color-scheme: dark;
	background: var(--surface-color);

	/* Without this, accent-color would be blue, not skyblue! */
	accent-color: var(--accent-color);

	/* Without this, text-color would be #111, not white! */
	color: var(--text-color);
}
```

{{ FEATURE_ISSUES("color-scheme") }}

## Fallback strategies

{{ FEATURE_FALLBACKS("color-scheme") }}

{{ FEATURE_FALLBACKS("light-dark") }}

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-atoms/component-specific-light-dark-theme/guide.md#L61-L114). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
