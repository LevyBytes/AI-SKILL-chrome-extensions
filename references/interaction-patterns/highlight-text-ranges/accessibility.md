Related section: [Highlight text ranges](overview.md).
## Accessibility

**AVOID**: using custom highlights as a replacement for semantic HTML.

Custom highlights are purely presentational and are not exposed to the accessibility tree. If the highlighted text is semantically relevant to the document (e.g., a user-selected passage), or where the highlight conveys meaning (e.g., to indicate a heading element or an ARIA attribute in an HTML tutorial to demonstrate how it is used), use `<mark>` instead. Reserve custom highlights for transient, visual-only effects like search results, or syntax coloring where the meaning can be derived from nearby indicators (e.g., a "+" sign before the highlighted text to indicate syntax that has been added).

Make sure that there is sufficient contrast between the highlight background color and text color to meeting WCAG 2.2 Success Criterion 1.4.3 Contrast (Minimum) (Level AA). The contrast ratio must be at least 4.5:1 for text with a font size of less than 18 point or 14 point bold, and at least 3:1 for text with a font size of greater than 18 point or 14 point bold.

Make sure that the contrast ratio between the highlight background color and adjacent colors is at least 3:1 to meet WCAG 2.2 Success Criterion 1.4.11 Non-text Content (Level AA). 
The contrast can be less than 3:1 if the highlighted text uses another visual indicator (e.g. `text-decoration: underline;` or the inclusion of a subtle `text-shadow` on the text) to further indicate that the text is highlighted.

Highlights must not rely solely on color to convey meaning. For example, if a highlight indicates an error, pair it with another visual indicator such as `text-decoration: wavy underline`, an adjacent text label, or an icon.

## Fallback strategies

{{ BASELINE_STATUS("highlight") }}

For browsers that do not support the CSS Custom Highlight API, you should provide a functional base experience where text is still legible, even without the visual highlight.

You can detect support before using the API:

```javascript
if (CSS.highlights) {
  // CSS Custom Highlight API is supported.
} else {
  // Fallback: wrap matches in <mark> elements.
}
```

If the highlight is critical for the user experience, fall back to wrapping matched text in `<mark>` elements. This modifies the DOM, so take care to preserve event listeners and avoid breaking the document structure.

```javascript
if (!CSS.highlights) {
  // Walk text nodes and wrap matches in <mark>, preserving structure.
  const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);
  const nodes = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) nodes.push(n);

  const term = searchTerm.toLowerCase();
  for (const textNode of nodes) {
    const text = textNode.textContent;
    let pos = text.toLowerCase().indexOf(term);
    if (pos === -1) continue;

    const frag = document.createDocumentFragment();
    let last = 0;
    while (pos !== -1) {
      frag.append(text.slice(last, pos));
      const mark = document.createElement("mark");
      // textContent assignment avoids HTML injection.
      mark.textContent = text.slice(pos, pos + term.length);
      frag.append(mark);
      last = pos + term.length;
      pos = text.toLowerCase().indexOf(term, last);
    }
    frag.append(text.slice(last));
    textNode.replaceWith(frag);
  }
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/highlight-text-ranges/guide.md#L86-L145). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
