- The table uses semantic `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, and `<td>` elements.
- The scrollable table wrapper has a `role="region"` attribute, an accessible name (via an `aria-labelledby` or `aria-label` attribute), and a `tabindex="0"` attribute.
- In the wide table layout, column headers remain fixed at the top of the scrollable area during vertical scroll.
- In the wide table layout, the first column (row headers) remains fixed at the inline start of the scrollable area during horizontal scroll.
- When the table container is narrow (via a `@container` width query), the table layout transforms into a stacked view where rows are separated blocks.
- In the stacked view, the `thead` element is hidden and is not accessible to screen readers.
- In the stacked view, each data cell (`td`) displays a label corresponding to its column header using a pseudo-element.
- In the stacked view, row headers (`tbody th`) are sticky at the top of their respective row block during scroll.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-atoms/responsive-table/expectations.md#L1-L8). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
