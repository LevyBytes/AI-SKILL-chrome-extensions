- Underlines, overlines, and strikethroughs are drawn with the native `text-decoration` properties, not with `border-bottom`, a background gradient, or a pseudo-element.
- The decoration's style, color, and thickness, and the `text-underline-offset`, are read from CSS custom properties or zero-specificity `:where()` defaults, so later overrides win.
- Decoration thickness and underline offset use relative units such as `em`, so they scale with the font size.
- A decorated link is a real `<a>` with an `href` destination, not a `javascript:` URL with a script handler.
- A link with a hover reveal underline trims its line with `text-decoration-inset` at rest, and returns the inset to `0` on both `:hover` and `:focus-visible`.
- The hover reveal declares its underline separately from `text-decoration-inset` and never only inside an `@supports` test for it, so the underline is visible where `text-decoration-inset` is unsupported.
- `text-decoration-skip-ink: auto` and `text-decoration-skip-spaces` are not declared when they would only restate the default or have no effect.
- Hover reveal and draw-on animations are not applied when `prefers-reduced-motion: reduce` matches, and the line is fully visible otherwise.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/visual-design/custom-text-decorations/expectations.md#L1-L8). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
