Related section: [Respect os text scale](overview.md).
### 4. Ensure Content Wrapping & Flexible Heights

When text scales up, elements require more vertical and horizontal space to prevent truncation or overlap. To keep your components robust, design your layouts to expand dynamically around the content rather than forcing rigid coordinates:

* **Allow Text Containers to Grow**: Text-containing components and containers MUST be able to grow to accommodate scaled text. Avoid fixed `height` or `block-size` values and restrictive `max-height` or `max-block-size` values that can cause clipping or overflow. Prefer content-driven sizing; use `min-height` or `min-block-size` only when a minimum size is needed.
* **Allow Natural Wrapping**: Do not restrict inline-axis text wrapping with `white-space: nowrap` on blocks that contain sentences. Let text reflow to new lines naturally.
* **Employ Flexible Flexbox & Grid wrapping (Optional Example)**: For multi-column card galleries, use reflowing columns like `repeat(auto-fit, minmax(min(100%, 16rem), 1fr))` so items stack vertically if their relative width thresholds are crossed:

```css
/* Card container using min-height to ensure expansion and auto-fit to reflow if needed */
.card {
  padding: 1.5rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  /* Use min-height so the box expands vertically when the font is enlarged */
  min-height: 10rem;
}
```

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

{{ BASELINE_STATUS("meta-text-scale") }}

On browsers where `<meta name="text-scale" content="scale">` is unsupported, the layout degrades gracefully. The page will display the layout at the browser's standard default base font size (typically 16px), and the user can still utilize standard manual page zoom or pinch-to-zoom options.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/respect-os-text-scale/guide.md#L85-L132). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
