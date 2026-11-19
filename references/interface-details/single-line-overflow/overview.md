```yaml
---
name: single-line-overflow
description: "Show text that must stay on one line, such as a tab label, table cell, navigation item, or file name, in a space it may not fit, without breaking the layout or losing the text."
web-feature-ids:
  - text-overflow
  - container-queries
  - scroll-driven-animations
  - container-style-queries
  - masks
  - interpolate-size
  - resize-observer
  - registered-custom-properties
  - individual-transforms
guides:
  - interest-triggered-tooltips
---
```

# Single-line text overflow

Text that has to stay on one line (tab and chip labels, table cells, sidebar items, file names, media titles) is often longer than its space, especially with user content and translations.

Keep the full text in the DOM and only adapt how it renders: the full text is the accessible name, and what find-in-page, copy, and search see.

This guide does not cover use cases where wrapping is an acceptable option.

There are two components to handling single-line text overflow:
1. How to display the truncated text
2. How can users find out what the full text is

{# TODO Handle SVG #}

## How to display truncated text

Truncation is visual only. Screen readers announce the full text, find-in-page matches it, and copying copies it. This is why the string must never be cut in script.

### 1. Truncate with an ellipsis (at the end or middle)

```css
.label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

- Use `overflow: hidden`, not `clip`. Both render the ellipsis, but only `hidden` makes the element a scroll container, which the fade, the scroll reveal, and the CSS detection of truncation below depend on.
- In flex/grid: Let the containing flex or grid item shrink. Items refuse to shrink below their content by default (`min-inline-size: auto`). When the truncated element is the item itself, `overflow: hidden` already allows it; when it is a descendant (such as a label inside a button), set `min-inline-size: 0` on the item.
- In tables, set `table-layout: fixed` and an inline size on the table. With automatic layout, cells grow to fit their text instead of truncating it.
- An element's own `overflow: hidden` does not clip its own focus outline, so buttons and links can truncate their text directly. Outlines are clipped by an ancestor that clips overflow, such as a scrolling row of items; give those items an inset outline (`outline-offset: -2px`).

#### Keeping the end visible

Wrap the part that may truncate, such as everything before the file extension or the last few characters, and leave the end as plain text after it. The split is in the markup (or done once in script when rendering), never by cutting characters out.

```html
<!-- No whitespace before the extension, or it renders as a space -->
<span class="filename"><span>quarterly-report-final-v2</span>.pdf</span>
```

```css
.filename {
  display: flex;
  white-space: nowrap;
}

/* The trailing text is an anonymous flex item, which never shrinks below its content */
.filename > span {
  overflow: hidden;
  text-overflow: ellipsis;
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-atoms/single-line-overflow/guide.md#L1-L72). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
