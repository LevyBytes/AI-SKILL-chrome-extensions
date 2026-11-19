#### Overrides are fine for specialization

This is fine:

```css
button {
  background: var(--color-neutral);
}

button.primary {
  background: var(--color-blue);
}
```

Both rules express legitimate _intent_: buttons are generally neutral, but primary ones are blue.

#### No global resets

**DO NOT** use global resets (styles on `*`) as they cannot be overridden by web components or lower-priority cascade layers (without `!important`). Instead, apply reset styles to specific element types and/or conditions.

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

See {{ GUIDE_REF('accessibility') }} for focus rings, touch targets, and custom gestures.

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

- Dark mode: see {{ GUIDE_REF('dark-mode') }} and {{ GUIDE_REF('component-specific-light-dark-theme') }}.
- Forced Colors Mode: see {{ GUIDE_REF('color') }}.
- Generating tints and shades: see {{ GUIDE_REF('color') }}.
- Theming browser-generated UI (selection, scrollbars, form controls): see {{ GUIDE_REF('browser-ui-theming') }}.

## 6. Responsive design

See {{ GUIDE_REF('responsive-design') }} for components that adapt to the space they are given, layouts that survive mobile browser UI appearing and disappearing, reserving space for media before it loads, and text that scales with the viewport.

## 7. Typography

See {{ GUIDE_REF('typography') }} for guidelines around readability, accessibility, and aesthetics of text on Web UIs.

## 8. Visual effects

See {{ GUIDE_REF('visual-effects') }} for look & feel enhancements such as conveying depth, texture, and elevation, blending layers, aesthetically pleasing gradients, and flexible pattern backgrounds.

## 9. Shapes

{# Move to element-shape once that guide is ready to publish #}

- Use `corner-shape: squircle` for more aesthetically pleasing curves as a progressive enhancement over regular rounded corners.
- Use elliptical `border-radius` (e.g., `10px / 20px`) for proportional curves without extra elements.

## 10. Transitions & animations

See {{ GUIDE_REF('motion') }}. For rendering performance (`content-visibility`, containment), see {{ GUIDE_REF('performance') }}.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/css/css/guide.md#L181-L274). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
