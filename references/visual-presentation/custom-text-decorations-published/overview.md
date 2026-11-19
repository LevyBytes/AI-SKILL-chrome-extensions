# Custom text decorations

Use the native `text-decoration` properties to style underlines, overlines, and strikethroughs, instead of faking them with borders, background gradients, or pseudo-elements. A native decoration follows the text across wrapped lines, tracks the font's metrics, skips glyph descenders, and inherits through nested elements, so none of that needs to be reimplemented. Reach for the box-based techniques at the end of this guide only when the decoration must outline or wrap the text rather than run along it.

Text decorations apply to any text, not only links. Where underlined text is not a link, make sure it cannot be mistaken for one. When decorating a link, use a real `<a href>` pointing at the destination (add `target="_blank" rel="noopener"` to open a new tab), not `href="javascript:void(0)"` with a script handler. A real link keeps middle-click, copy-link, and screen reader behavior.

## Style the line

Set line, style, color, and thickness with the `text-decoration` shorthand, and the gap from the text with `text-underline-offset`. Wrap the selector in `:where()` so the defaults have zero specificity and any later override wins, without needing custom properties.

```css
:where(.decorated) {
  /* Thickness is relative to the font size (0.08em is an example value), so the line is not too heavy
     on small text or too light on large text, and max() keeps it at least 1px so it never disappears. */
  text-decoration: underline solid currentColor max(1px, 0.08em);
  /* Use em so the gap scales with the font size. 0.2em clears most descenders; example value. */
  text-underline-offset: 0.2em;
}

/* Example hover state: a softer line that firms up on hover and focus. The 50% mix and
   0.12em thickness are example values. */
:where(.decorated) {
  text-decoration-color: color-mix(in srgb, currentColor, transparent);
}

:where(.decorated:is(:hover, :focus-visible)) {
  text-decoration-color: currentColor;
  text-decoration-thickness: max(1px, 0.12em);
}

/* Other lines are a different text-decoration-line on the same properties */
.decorated-over    { text-decoration-line: overline; }
.decorated-through { text-decoration-line: line-through; }
```

`text-decoration-style` accepts `solid`, `double`, `dotted`, `dashed`, and `wavy`. `text-underline-offset` applies to underlines only.

Starting points for the design:

* **Thickness:** about `0.06em` to `0.1em` for body text. Go thicker (`0.1em` to `0.15em`) for headings and emphasized states.
* **Offset:** about `0.15em` to `0.25em`. Dotted and wavy lines need a little more room than solid ones, so raise the offset for them.
* **Color:** `currentColor` keeps the line matched to the text. A softer mix of the text color that firms up on hover keeps long runs of links calm.
* **Style:** `solid` for links, `dotted` for terms and abbreviations, and `wavy` for annotations such as errors.

## Control where the line is skipped

### Ink skipping

By default, underlines and overlines break around glyph parts that cross them, such as descenders. Set `text-decoration-skip-ink` to choose the behavior:

```css
.decorated {
  /* auto: skip ink for most scripts (default). none: draw straight through.
     all: also skip ink in scripts where auto does not, such as Japanese or Chinese. */
  text-decoration-skip-ink: all;
}
```

* Keep `auto` for Latin text, and do not declare it: it is the default.
* Use `all` when the underline sits close enough to the baseline to cross ideographic glyphs, or when mixed-script text must look consistent.
* Use `none` for a very thick line, or a deliberately decorative one, where gaps would look like breaks.


#### Skip spaces

`text-decoration-skip-spaces` decides whether the line is drawn under spaces. The default, `start end`, leaves leading and trailing spaces undecorated.

```css
.decorated {
  /* Spaces collapse by default, so there is nothing to skip. Preserve them when the
     leading or trailing spaces are meaningful, such as padded input values. */
  white-space: pre;
  /* none: decorate every space. all: skip every space, so each word is underlined separately.
     start | end | start end: skip only leading, trailing, or both. */
  text-decoration-skip-spaces: all;
}
```

Do not declare `text-decoration-skip-spaces` unless the decoration should visibly cover padding (`none`) or break between every word (`all`). Ordinary inline text, such as the text of a link, has no leading or trailing spaces, so the declaration does nothing.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/visual-design/custom-text-decorations.md#L1-L80). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
