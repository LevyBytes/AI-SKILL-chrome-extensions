### Fallbacks & browser support for light-dark() image values

Baseline status for light-dark() image values: Newly available. It's been Baseline since 2026-09-14.
Supported by: Chrome 150 (Jun 2026), Edge 150 (Jul 2026), Firefox 150 (Apr 2026), and Safari 27 (Sep 2026).

For browsers that do not support `light-dark()` for images, use `image-set()` as a switch:
give each option a `type()` from a custom property, and set the inactive one to an unsupported MIME type so the browser discards that option.
The active option gets an empty value, so it is a plain `image-set()` option with no `type()`.

Define the switch once on `:root`. Every use site then only needs both images inline, like `light-dark()`.

```css
:root {
  --light-type: ;
  --dark-type: type("image/do-not-use");

  /* MANDATORY: Fallback for browsers without light-dark() image support */
  @media (prefers-color-scheme: dark) {
    --light-type: type("image/do-not-use");
    --dark-type: ;
  }
}

.hero {
  background-image: image-set(url(hero-light.png) var(--light-type), url(hero-dark.png) var(--dark-type));

  @supports (background-image: light-dark(url("a"), url("b"))) {
    background-image: light-dark(url(hero-light.png), url(hero-dark.png));
  }
}
```

- Only the selected image is downloaded.
- Resolutions still work: `image-set(url(a-1x.png) 1x var(--light-type), url(a-2x.png) 2x var(--light-type), url(b-1x.png) 1x var(--dark-type), url(b-2x.png) 2x var(--dark-type))`.
- **DO NOT** use `type("")` for the active option. Browsers treat the empty string as unsupported and drop every option.
- Unlike `light-dark()`, the switch does not follow `color-scheme` set on a subtree. A manual toggle, or any subtree that sets `color-scheme`, MUST also flip `--light-type` and `--dark-type`.

### Alternative: one custom property per image

Simpler when only a handful of images vary, but every image needs its own media query branch, and a manual toggle must flip each one.

```css
:root {
  --hero-image: url(hero-light.png);

  @media (prefers-color-scheme: dark) {
    --hero-image: url(hero-dark.png);
  }

  @supports (background-image: light-dark(url("a"), url("b"))) {
    --hero-image: light-dark(url(hero-light.png), url(hero-dark.png));
  }
}

.hero {
  background-image: var(--hero-image);
}
```

### Fallbacks & browser support for image()

image() is not natively supported by any major browser yet.

Use a gradient with a single color stop and no positions, e.g. `linear-gradient(blue)`.

Baseline status for the css.types.gradient.linear-gradient.single_color_stop capability: Newly available. It's been Baseline since 2025-04-04.
Supported by: Chrome 135 (Apr 2025), Edge 135 (Apr 2025), Firefox 136 (Mar 2025), and Safari 18.4 (Mar 2025).

For broader browser support, you can explicitly provide `0 100%` positions for the single color stop, e.g. `linear-gradient(blue 0 100%)`.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/visual-design/dark-mode.md#L236-L305). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
