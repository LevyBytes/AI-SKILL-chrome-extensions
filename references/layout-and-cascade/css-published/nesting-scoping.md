### Nesting and scoping

Use native CSS nesting to group related styles to the extent it improves maintainability and readability.

Prefer `@scope` over nesting when proximity should matter more than pure specificity. This is common in selectors that can be nested in any order, but the closest matching one (in element -> ancestor order) should win, e.g. theming classes.

For example this will not work as expected:
```css
.dark .invert { color-scheme: light }
.light .invert { color-scheme: dark }
```

If `.invert` is nested within _both_ `.dark` and `.light`, it will always resolve to dark mode as both rules have the same specificity.
Using `@scope` fixes this:

```css
@scope (.dark) {
  .invert { color-scheme: light }
}

@scope (.light) {
  .invert { color-scheme: dark }
}
```

## 4. Interactivity

See `accessibility` (via `npx -y modern-web-guidance@latest retrieve "accessibility"`) for focus rings, touch targets, and custom gestures.

## 5. Design Tokens and Theming

Use CSS custom properties on `:root` to define core design variables (colors, fonts, sizes, etc) used throughout the design, for visual consistency and to scale UI design across teams.
**DO NOT** specify nontrivial styling values inline. E.g. `background: transparent` or `padding: 0` is ok, but `background: #f06` or `padding: .3em` are not.
One exception is use cases where keeping code small and simple is far more important than long-term maintainability and evolution, such as testcases.

Typically these are organized in tiers, with each tier building upon the previous one. For example:
1. Tier 1: Literal design tokens (e.g. `--color-blue-10`, `--color-gray-90`, `--font-sans-serif`, `--size-xl` etc)
2. Tier 2: Semantic design tokens (e.g. `--color-accent`, `--color-neutral`, `--font-body`, `--font-heading` etc)
3. Tier 3: General UI design tokens (e.g. `--ui-border`, `--surface-bg-subtle` etc)
4. Tier 4: Component-specific design tokens (e.g. `--button-bg-primary-hover`, `--button-border-color-secondary` etc)

The smaller the scope of the use case, the fewer tiers it needs. E.g. a quick demo or toy app are fine with one tier. Do not overengineer.
Check for any existing conventions around naming and levels before inventing your own.

### Theming

- Dark mode: see `dark-mode` (via `npx -y modern-web-guidance@latest retrieve "dark-mode"`) and `component-specific-light-dark-theme` (via `npx -y modern-web-guidance@latest retrieve "component-specific-light-dark-theme"`).
- Forced Colors Mode: see `color` (via `npx -y modern-web-guidance@latest retrieve "color"`).
- Generating tints and shades: see `color` (via `npx -y modern-web-guidance@latest retrieve "color"`).
- Theming browser-generated UI (selection, scrollbars, form controls): see `browser-ui-theming` (via `npx -y modern-web-guidance@latest retrieve "browser-ui-theming"`).

## 6. Responsive design

See `responsive-design` (via `npx -y modern-web-guidance@latest retrieve "responsive-design"`) for components that adapt to the space they are given, layouts that survive mobile browser UI appearing and disappearing, reserving space for media before it loads, and text that scales with the viewport.

## 7. Typography

See `typography` (via `npx -y modern-web-guidance@latest retrieve "typography"`) for guidelines around readability, accessibility, and aesthetics of text on Web UIs.

## 8. Visual effects

See `visual-effects` (via `npx -y modern-web-guidance@latest retrieve "visual-effects"`) for look & feel enhancements such as conveying depth, texture, and elevation, blending layers, aesthetically pleasing gradients, and flexible pattern backgrounds.

## 9. Shapes

- Use `corner-shape: squircle` for more aesthetically pleasing curves as a progressive enhancement over regular rounded corners.
- Use elliptical `border-radius` (e.g., `10px / 20px`) for proportional curves without extra elements.

## 10. Transitions & animations

See `motion` (via `npx -y modern-web-guidance@latest retrieve "motion"`). For rendering performance (`content-visibility`, containment), see `performance` (via `npx -y modern-web-guidance@latest retrieve "performance"`).

## 11. Generated content
See `accessible-generated-content` (via `npx -y modern-web-guidance@latest retrieve "accessible-generated-content"`) for adding decorative or supplementary content with CSS without breaking screen readers or copy-paste.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/css/css.md#L176-L250). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
