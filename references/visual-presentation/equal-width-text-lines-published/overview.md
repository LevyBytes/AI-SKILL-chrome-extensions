Related section: [For text-fit](text-fit.md).
# Equal-Width Text Lines

Poster-style lockups where each line is scaled so it spans the container's full width can create visually striking headings.
Using `text-fit`, the browser scales each line during layout, so it stays correct on resize, copy changes, and font load.

For a single line filling its container (e.g. a heading or pull quote), apply `text-fit` to that element directly; this guide covers multi-line lockups.

## Basic implementation

Note: Line breaks in a lockup are either **forced** (each line is its own block) or **free** (the browser wraps). This is a continuum: a lockup can be all forced, all free, or a mix.

For forced lines:
- Wrap each line in a `<span>` with `display: block`.
- Apply `white-space: nowrap` to each forced line `<span>`.

Implementation guidelines:
- Use `text-fit: grow per-line-all <percentage>` on the heading itself.
- Use `per-line-all`, not `per-line`. `per-line` skips the last line and any line ending in a forced break, so with one block per line it scales nothing.
- `grow` cannot be combined with `shrink`. Either set the base `font-size` to a maximum or a minimum depending on what would be a better fallback or easier to calculate, and set `text-fit` to `shrink` or `grow` accordingly. If you don’t have a reason to use `shrink`, prefer `grow` + setting `font-size` to a minimum, as it's safer for most cases.
- Always limit growth or shrinkage with the percentage (e.g. `300%`) as a guardrail.
- The container needs a definite inline size. `text-fit` never changes intrinsic size, so it does nothing on `fit-content`/`max-content` widths or content-sized flex/grid items.
- Trim the leading above the first and below the last line: see `precise-text-alignment` (via `npx -y modern-web-guidance@latest retrieve "precise-text-alignment"`).
- Keep `line-height` small, `1` or under, otherwise gaps between lines of different font-sizes become unwieldy.
- IMPORTANT: Note that computed `font-size` is unchanged, so `em` spacing does not scale.
- To avoid accidental over-emphasized orphans, apply `text-wrap: balance` or `text-wrap: pretty` if there are free lines.


### Spacing

If all lines are forced, this produces more control over spacing:
- Apply `text-box: trim-both cap alphabetic` to each line block so its box hugs its own glyphs. It trims using the scaled metrics. See `precise-text-alignment` (via `npx -y modern-web-guidance@latest retrieve "precise-text-alignment"`) for more details.
- Space lines using Flexbox or Grid + `gap` on the heading, not `line-height`. Gaps are then uniform instead of growing with each line's font-size.

If some lines are free, do not use `text-box`: it only trims the first and last line, so the outer lines would hug the glyphs while interior gaps keep their leading. Let `line-height` govern all spacing.

## Visual design

- Lockups look best when there is significant variance in font sizes between lines. Avoid creating lockups from text with mostly uniform lines, as it will result in font sizes that are neither the same, nor sufficiently different, violating the design principle of _contrast_. You can ensure this by forcing short lines: wrap the words to emphasize in a block and let the rest wrap, i.e. a mixed lockup. This is especially important when combining with `text-wrap: balance`.
- Prefer combining this with `text-transform: uppercase` when used with Western scripts, as ascenders and descenders tend to create trapped space and/or overlap adjacent lines, which creates a less aesthetically pleasing result.
- When forcing short lines, pick words that would enhance the message if emphasized.
- **Limitation:** Growing text will also increase in visual weight and its strokes will be perceived as stronger. There is currently no way to counterbalance this e.g. by reducing `font-weight` for larger text, since there is no unit to use in a calculation, since the scaling does not affect font-relative units like `em`.

## Fallback strategies

### For `text-box`

Browser support for text-box: Limited availability.
Supported by: Chrome 133 (Feb 2025), Edge 133 (Feb 2025), and Safari 18.2 (Dec 2024).
Unsupported in: Firefox.

`text-box` needs no separate fallback: keep the small `line-height` on fixed lockups too. It is a no-op under `text-box` and keeps gaps tight where it is unsupported, at the cost of gaps that scale with each line's font-size.

### For `text-wrap: balance`

Baseline status for text-wrap: balance: Newly available. It's been Baseline since 2024-05-13.
Supported by: Chrome 114 (May 2023), Edge 114 (Jun 2023), Firefox 121 (Dec 2023), and Safari 17.5 (May 2024).


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/visual-design/equal-width-text-lines.md#L1-L57). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
