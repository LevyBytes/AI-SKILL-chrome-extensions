Related section: [Visual effects](overview.md).
## Patterns

Many patterns can be created via CSS gradients + hard stops, and these can be more flexible and performant than SVGs or external images as they can have access to CSS variables and lengths from the surrounding context.
You don't need to repeat the position twice — just use `0` or `0%` and gradient fixup will auto-adjust it.

Examples below.

Vertical stripes of `1em` width each:

```css
background: linear-gradient(to right, var(--color-1) 50%, var(--color-2) 0) 0 / 2em;
```

Diagonal stripes of `1em` width each:

```css
background: repeating-linear-gradient(-45deg, var(--color-1) 0 1em, var(--color-2) 0 2em);
```

Checkerboard pattern with `1em` squares:

```css
background: repeating-conic-gradient(var(--color-1) 0 25%, var(--color-2) 0 50%) 0 / 2em 2em;
```

Polka dot with `.5em` radius dots spaced `2em` apart (horizontally/vertically — multiply by `sqrt(2)` for diagonal distance):

```css
--distance: 2em;
--radius: .5em;
--polka: radial-gradient(circle, var(--color-1) var(--radius), transparent calc(var(--radius) + 1px));
background: var(--polka) 0 0, var(--polka) var(--distance) var(--distance) var(--color-2);
background-size: calc(var(--distance) * 2) calc(var(--distance) * 2);
```

Simple pie chart:

```css
.pie {
  --p: 80%;
  width: 60px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: conic-gradient(var(--color-1) var(--p), transparent 0%) var(--color-2);
}
```

**Important:** Because CSS backgrounds are not exposed to assistive technologies, always pair gradient charts with an accessible textual representation of the data — for example, visible percentage text or an accessible label for a simple proportion, or a semantic `<table>` or `<dl>` for multi-part breakdowns.

## Accessibility considerations

Text and icons placed over a gradient or pattern background, and text filled with a gradient, need enough contrast against every color in the gradient. Check them against each color stop: at least 4.5:1 for text, 3:1 for large text (at least 24px, or at least 18.66px bold), and 3:1 for icons (WCAG 1.4.3 Contrast (Minimum), WCAG 1.4.11 Non-text Contrast). For more on contrast, see {{ GUIDE_REF("color") }}.

```css
.myButton {
  /* The label color has at least 4.5:1 contrast against both gradient stops. */
  color: #111111;
  background: linear-gradient(in oklab, #ffffff, #aaaaff);
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/visual-design/visual-effects/guide.md#L74-L133). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
