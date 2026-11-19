Related section: [Patterns](patterns.md).
# Visual effects

### Depth and texture

- Layer multiple shadows for realistic soft depth effects.
- Use `filter: drop-shadow()` instead of `box-shadow` for non-rectangular shapes or transparent PNGs.
- Use `mix-blend-mode` and `background-blend-mode` for lighting overlays (limit scope with `isolation: isolate`)

```css
.hero {
  background-image: url('texture.png'), linear-gradient(to bottom, #fff, #eee);
  background-blend-mode: soft-light;
}
```

### Gradients and `color-mix()`

Use `in oklab` or `in oklch` to explicitly specify the interpolation color space for gradients or `color-mix()`.
- Prefer `in oklab` by default for `color-mix()`, especially when mixing neutrals. Using `oklch` for neutrals provides no benefit, and due to a Chromium bug (565837690) low chroma oklch colors have powerless hue angles (`none`), which resolve to `0deg` (magenta-red) and cause an unintended reddish/pink tint shift when rendered. Cartesian `in oklab` scales `(a, b)` coordinates linearly toward `(0, 0)` without computing a polar hue angle, preserving the exact hue and preventing tint shifts.
- `in oklab` stays in gamut more easily (assuming in-gamut endpoints) but can create washed out desaturated colors in the middle when interpolating between two opposing saturated hues.
- `in oklch` preserves chroma better when interpolating gradients between two distinct saturated chromatic hues, but can more easily get out of device gamut, especially for bigger differences between colors. Avoid using `in oklch` for alpha transparency fades or mixing neutral colors.
- *DON'T* use `in srgb` unless you have a specific reason to do so (e.g. you are building a color picker that needs to interpolate in srgb).

#### Fallback

Some pre-2024 browsers do not support gradient color interpolation space.
To support these browsers, use the token only when its usage is safe by defining a variable:

```css
:root {
  --in-oklab: ;
  --in-oklch: ;
}

@supports (background: linear-gradient(in oklab, white, black)) {
  :root {
    --in-oklab: in oklab;
    --in-oklch: in oklch;
  }
}
```

Then use like:

```css
.card {
  background: linear-gradient(to bottom var(--in-oklab), var(--accent-color), var(--darker));
}
```

- **Important:** If you use this technique, make sure there is always a non-empty gradient preamble without it, otherwise it will be a syntax error in older browsers.
- You do NOT need this for `color-mix()`. If a browser supports `color-mix()`, it also supports its `in <color-space>` argument.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/visual-design/visual-effects.md#L1-L53). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
