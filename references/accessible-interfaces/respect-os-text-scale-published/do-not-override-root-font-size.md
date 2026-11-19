Related section: [Respect os text scale](overview.md).
### 5. DO NOT Override the Root Font Size

When opting in via the `<meta name="text-scale" content="scale">` element, **DO NOT** explicitly set the root `font-size` in your stylesheet. This includes declarations on either `:root` or `html`, and applies to absolute units, relative units, and calculated values.

For example, do not override the root font size with a fixed value:

```css
/* ❌ DO NOT DO THIS: This can prevent the browser from applying text scaling */
html {
  font-size: 16px;
}
```

Do not combine the `<meta name="text-scale" content="scale">` opt-in with `env(preferred-text-scale)` to apply operating system text scaling manually. The browser applies the scale through the meta opt-in, so using both can result in double-scaling:

```css
/* ❌ DO NOT DO THIS: The meta opt-in already applies the operating system text scale */
:root {
  font-size: calc(1rem * env(preferred-text-scale));
}
```

Leave the root font size to the browser. The browser handles the operating system text scale automatically and applies it to content sized relative to the root font size.

## Fallback Strategies

Browser support for `<meta name="text-scale">`: Limited availability.
Supported by: Chrome 146 (Mar 2026) and Edge 146 (Mar 2026).
Unsupported in: Firefox and Safari.

On browsers where `<meta name="text-scale" content="scale">` is unsupported, the layout degrades gracefully. The page will display the layout at the browser's standard default base font size (typically 16px), and the user can still utilize standard manual page zoom or pinch-to-zoom options.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/accessibility/respect-os-text-scale.md#L97-L127). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
