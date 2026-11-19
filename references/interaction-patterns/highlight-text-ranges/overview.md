Related section: [Accessibility](accessibility.md).
```yaml
---
name: highlight-text-ranges
description: Highlight arbitrary text ranges on a page such as search results, spelling errors, or collaborative editing cursors.
web-feature-ids:
  - highlight
---
```

# Highlight Text Ranges

The CSS Custom Highlight API lets you style arbitrary text ranges on a page without modifying the DOM structure. This enables search-result highlighting, syntax coloring, collaborative editing cursors, or spelling and grammar error markers without wrapping text in extra elements or relying on `innerHTML` manipulation.

## Core implementation

To highlight text ranges, you must collect the target text nodes, create `Range` and `Highlight` objects, register them in the `HighlightRegistry`, and then style them with the `::highlight()` pseudo-element.

### 1. Collect text nodes and create ranges

Use a `TreeWalker` to collect all text nodes in the target element, then create `Range` objects pointing at the character offsets you want to highlight.

```javascript
const article = document.querySelector("article");

// MANDATORY: Use TreeWalker to collect text nodes — do not manipulate innerHTML.
const treeWalker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);
const allTextNodes = [];
let currentNode = treeWalker.nextNode();
while (currentNode) {
  allTextNodes.push(currentNode);
  currentNode = treeWalker.nextNode();
}

// MANDATORY: Set range start/end on text nodes, not element nodes.
const range = new Range();
range.setStart(textNode, matchStartIndex);
range.setEnd(textNode, matchEndIndex);
```

Cache the text-node list and only rebuild it when the DOM content actually changes, since walking the tree is expensive.

### 2. Create a Highlight from the ranges

Group one or more `Range` objects into a `Highlight`. Multiple ranges that share the same style belong in a single highlight.

```javascript
const searchHighlight = new Highlight(...matchingRanges);
```

### 3. Register the highlight in the registry

Register each `Highlight` under a custom name using `CSS.highlights`, which is a `Map`-like `HighlightRegistry`.

```javascript
// MANDATORY: Clear previous highlights before registering new ones
// to avoid stale ranges persisting on the page.
CSS.highlights.clear();

CSS.highlights.set("search-results", searchHighlight);
```

When multiple highlights overlap, use the `priority` property to control stacking order. Higher priority highlights paint on top.

```javascript
const primary = new Highlight(...primaryRanges);
primary.priority = 1;

const secondary = new Highlight(...secondaryRanges);
secondary.priority = 0; // painted first (behind primary)

CSS.highlights.set("primary", primary);
CSS.highlights.set("secondary", secondary);
```

### 4. Style with `::highlight()`

Use the `::highlight()` pseudo-element in CSS to style each registered highlight by name.

```css
::highlight(search-results) {
  background-color: #0000FF;
  color: white;
}
```

Only a limited set of CSS properties work inside `::highlight()`: `color`, `background-color`, `text-decoration` and its longhands, `text-shadow`, `-webkit-text-stroke-color`, `-webkit-text-fill-color`, and `-webkit-text-stroke-width`. Properties like `background-image`, `font-size`, or `padding` are ignored.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/highlight-text-ranges/guide.md#L1-L85). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
