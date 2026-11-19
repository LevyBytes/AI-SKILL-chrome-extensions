Related section: [Highlight text ranges](overview.md).
## Fallback strategies

Baseline status for Custom highlights: Newly available. It's been Baseline since 2026-03-24.
Supported by: Chrome 105 (Sep 2022), Edge 105 (Sep 2022), Firefox 149 (Mar 2026), and Safari 17.2 (Dec 2023).

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

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/highlight-text-ranges.md#L92-L139). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
