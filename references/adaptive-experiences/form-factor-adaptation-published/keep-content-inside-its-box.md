Related section: [Form factor adaptation](overview.md).
### Keep content inside its box

Ensure text and controls are never clipped, squished to zero dimensions, or overflowing at any viewport width down to 320 CSS pixels (WCAG 1.4.10). Content that needs a two-dimensional layout to be understood, such as data tables, maps, and diagrams, may scroll horizontally inside its own container while the page doesn't. Make that container keyboard-scrollable with `tabindex="0"`, and give it `role="region"` and an accessible name. For making data tables adapt to smaller viewports, see `responsive-table` (via `npx -y modern-web-guidance@latest retrieve "responsive-table"`).

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
- To allow text and layouts to scale with operating system accessibility settings, see `respect-os-text-scale` (via `npx -y modern-web-guidance@latest retrieve "respect-os-text-scale"`). To size form controls dynamically as users type, see `form-fields-automatically-fit-contents` (via `npx -y modern-web-guidance@latest retrieve "form-fields-automatically-fit-contents"`).

## Fallback strategies

### Text wrapping

Baseline status for text-wrap: balance: Newly available. It's been Baseline since 2024-05-13.
Supported by: Chrome 114 (May 2023), Edge 114 (Jun 2023), Firefox 121 (Dec 2023), and Safari 17.5 (May 2024).

Browser support for text-wrap: pretty: Limited availability.
Supported by: Chrome 117 (Sep 2023), Edge 117 (Sep 2023), and Safari 26 (Sep 2025).
Unsupported in: Firefox.

Browsers without support ignore `text-wrap: balance` and `text-wrap: pretty` and wrap text normally. No fallback is needed.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/user-experience/form-factor-adaptation.md#L85-L120). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
