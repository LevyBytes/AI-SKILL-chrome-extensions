Related section: [3. Indeterminate state styling](indeterminate-state-styling.md).
# Build a Styled Progress Bar

The `<progress>` element is the semantic way to represent the completion progress of a task, like downloading or uploading information or completing part of a multi-step process. Using the native element helps with accessibility, as screen readers have an implicit `role="progressbar"` and can announce values.

This guide implements a fully styled horizontal progress bar with style customizations.

## Progress bar or progress ring?

- If space is constrained or a square aspect ratio is preferable, consider using a circular progress bar (progress ring): `progress-ring` (via `npx -y modern-web-guidance@latest retrieve "progress-ring"`)
- Prefer spinners for most indeterminate progress scenarios (`spinner` (via `npx -y modern-web-guidance@latest retrieve "spinner"`)). Use indeterminate progress bars when the indeterminate state is temporary and will soon be replaced by a determinate progress bar (e.g. waiting for metadata around an upload before a progress % can be shown)

## Markup

1.  **Use a native `<progress>` element**: It provides built-in accessibility and platform-consistent behavior.
2. Use `max` if a scale different from the default 0-1 scale is needed.
3. For a specific progress value, set a `value` attribute. Omit `value` for an indeterminate state (e.g. before more concrete feedback starts).
4. Use `<label for="...">`, `aria-labelledby`, or `aria-label` to associate the progress element with a label.

## What type of customization is needed?

For limited styling, these properties are sufficient:
- `accent-color` to change the color of the progress bar
- `width` / `inline-size` to change the width of the progress bar
- `height`/`block-size` applies inconsistently — test first
- `writing-mode: vertical-lr` for vertical bars.
- Effects that apply after painting: `opacity`, `filter`, `clip-path`, masks, transforms, `box-shadow`, etc.

If limited styling suffices, skip the next section.

WARNING: Certain properties (e.g. `border-radius`, `background`, `border`) will silently disable the default progress bar styling. If you need styling beyond the properties above, you must implement fully custom styling as described in the next section. Do NOT apply more extensive styling "just in case it works".

## Fully custom styling

### 1. Basic setup

- MANDATORY: Use `appearance: none` to enable custom styling.
- Reset UA borders with `border: 0 solid`
- To clip the active bar to the element’s border-radius, use `overflow: clip` OR apply the same `border-radius` to the bar. Do NOT use `border-radius: inherit` on the bar, which depends on the specific structure of elements in the shadow DOM.

```css
progress {
  /* Reset default browser styles */
  appearance: none;
  border: 0 solid;
  /* Clip bar to element’s border-radius  */
  overflow: clip;
}
```

### 2. Styling

- Style the track on the `progress` element itself.
- Use the appropriate browser-targeted pseudo-element to target the progress bar itself: `::-webkit-progress-value` for WebKit/Blink and `::-moz-progress-bar` for Firefox.
- MANDATORY: Do NOT group `-webkit-` and `-moz-` pseudo-elements in the same rule. The rule will be deemed invalid and will be ignored. `:is()` and `:where()` do not help here, as they don't support pseudo-elements.
- Each browser-targeted pseudo-element should appear exactly once. State-specific customizations (such as the indeterminate segment size and animation) should be routed through custom properties set on the `progress` element itself.
- Optional: Transition `inline-size` on the fill so determinate value changes animate instead of jumping. Firefox sizes the fill in layout and ignores it, which is harmless.

```css
progress {
  --progress-bar-radius: 1e5px;
  border-radius: var(--progress-bar-radius);
  /* Apply color for custom progress track (background) */
  background: var(--progress-bar-track, var(--color-neutral-90));
  /* Subtle depth on the empty part of the track */
  box-shadow: inset 0 1px 2px rgb(0 0 0 / 0.1);
}

/* Let <progress> styling show through */
progress::-webkit-progress-bar {
  background: transparent;
}

/* Webkit, Chrome */
progress::-webkit-progress-value {
  background: var(--progress-bar-fill, var(--accent-color));
  border-radius: var(--progress-bar-radius);
  transition: inline-size 0.3s;
}

/* Firefox */
progress::-moz-progress-bar {
  background: var(--progress-bar-fill, var(--accent-color));
  border-radius: var(--progress-bar-radius);
  transition: inline-size 0.3s;
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/progress.md#L1-L87). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
