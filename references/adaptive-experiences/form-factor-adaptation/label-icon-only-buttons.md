Related section: [Form factor adaptation](overview.md).
### Label icon-only buttons

Give every icon-only button an accessible name using `aria-label`, an `<img alt>`, or visually hidden text, and hide decorative icons with `aria-hidden="true"`. For more accessible naming patterns, see {{ GUIDE_REF("accessibility") }}.

### Keep content inside its box

Ensure text and controls are never clipped, squished to zero dimensions, or overflowing at any viewport width down to 320 CSS pixels (WCAG 1.4.10). Content that needs a two-dimensional layout to be understood, such as data tables, maps, and diagrams, may scroll horizontally inside its own container while the page doesn't. Make that container keyboard-scrollable with `tabindex="0"`, and give it `role="region"` and an accessible name. For making data tables adapt to smaller viewports, see {{ GUIDE_REF("responsive-table") }}.

```css
/* Media never overflows its column. */
img, video { max-inline-size: 100%; block-size: auto; }
/* Long words and URLs wrap instead of widening the page. */
body { overflow-wrap: break-word; }
/* Long URLs and code also wrap inside flex items and table cells. */
:where(a, code) { overflow-wrap: anywhere; }
/* Flex and grid items don't shrink below their content by default. Let non-control items shrink so controls keep their minimum size. */
:where(.toolbar > :not(button, input, select, textarea, a, [role="button"], label)) { min-inline-size: 0; }
.toolbar { display: flex; }
/* The target-size minimum lets controls in a crowded row shrink below their text, so let nav bars and toolbars that are already rows wrap. */
:where(nav, nav ul, .toolbar) { flex-wrap: wrap; }
```

- Use `min-block-size` instead of a fixed `height` on anything that contains text.
- Use `overflow-wrap: break-word` for text, and `anywhere` only on elements that hold long unbroken strings, such as links and code: `anywhere` also lets flex items and table cells shrink below their longest word, which breaks ordinary words mid-word.
- DO NOT truncate headings with `text-overflow: ellipsis`, and do not clip controls with `overflow: hidden` on their parents.
- DO NOT set `overflow-x: hidden` or `clip` on `html` or `body` to stop the page scrolling sideways: content past the edge is cut off and users can't scroll to it. Make the element that is too wide fit instead.
- To allow text and layouts to scale with operating system accessibility settings, see {{ GUIDE_REF("respect-os-text-scale") }}. To size form controls dynamically as users type, see {{ GUIDE_REF("form-fields-automatically-fit-contents") }}.

## Fallback strategies

### Text wrapping

{{ BASELINE_STATUS("text-wrap-balance") }}
{{ BASELINE_STATUS("text-wrap-pretty") }}

Browsers without support ignore `text-wrap: balance` and `text-wrap: pretty` and wrap text normally. No fallback is needed.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/user-experience/form-factor-adaptation/guide.md#L93-L128). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
