Related section: [Optionally animate the reorder](optionally-animate-reorder.md).
# Sortable Table

Use this pattern to let users sort a data table by clicking its column headers. Start from a complete, semantic `<table>` that is readable without JavaScript, then enhance it.

This guide covers the header controls, sort state, sorting logic, and applying the new order to the DOM. For keeping state inside rows while they move, see `move-dom-element-without-losing-state` (via `npx -y modern-web-guidance@latest retrieve "move-dom-element-without-losing-state"`). For other narrow-screen table patterns, see `responsive-table` (via `npx -y modern-web-guidance@latest retrieve "responsive-table"`).

For sorting lists and card grids that are not tables, see `dynamic-sort` (via `npx -y modern-web-guidance@latest retrieve "dynamic-sort"`).

## Header markup

* **MANDATORY:** Put a `<button type="button">` inside each sortable `<th scope="col">`. Do not make the `<th>` itself clickable, and do not use `<a>` or `role="button"`.
* Set `aria-sort="ascending"` or `aria-sort="descending"` on the `<th>` of the currently sorted column only, and remove it from all other headers. Do not set `aria-sort="none"`, and do not put `aria-sort` on the button.
* Leave non-sortable columns as plain `<th>` text with no button. Keep their padding, alignment and font weight matching the sortable headers: drop the cell padding only on `th:has(> button)`, since the button supplies it.
* Keep the table's `<caption>` as its accessible name, and keep data rows in a `<tbody>` so sorting reorders only body rows and never the `<thead>` row.
* Use a decorative icon for the sort direction (`aria-hidden="true"`, `currentColor`, see `icons` (via `npx -y modern-web-guidance@latest retrieve "icons"`)). Drive its appearance from `th[aria-sort]` in CSS, not from extra classes or JavaScript. The icon is visual only and hidden from assistive technology, so always convey the sort state with `aria-sort` on the `<th>`.
* Give the button a minimum 24px target and a `:focus-visible` outline. Make it fill the cell.

## Wire buttons with invoker commands

Use `commandfor` pointing at the table and a custom `--sort` command (custom commands must start with `--`). Handle it with one `command` listener on the table instead of a click listener per button. `event.source` is the button that was activated.

```html
<th scope="col" data-type="number">
  <button type="button" commandfor="planets" command="--sort">
    Moons
  </button>
</th>
```

```javascript
table.addEventListener('command', (event) => {
  if (event.command !== '--sort') return;

  const th = event.source.closest('th');
  const direction = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';

  for (const header of table.tHead.rows[0].cells) header.removeAttribute('aria-sort');
  th.setAttribute('aria-sort', direction);

  const rows = sortRows([...tbody.rows], th.cellIndex, th.dataset.type, direction);
  reorderWithTransition(rows);
  // One message per sort; the status element must already be in the DOM.
  status.textContent = `Sorted by ${event.source.textContent.trim()}, ${direction}, ${rows.length} rows`;
});
```

* The first activation sorts ascending; each repeat toggles direction. Switching columns starts ascending again.
* Keep focus on the header button that was activated.

## Compare values correctly

* Compare text with `Intl.Collator` (`numeric: true, sensitivity: 'base'`), not `<` or `localeCompare` in a loop.
* Compare numbers, dates and currency as numbers. Read the raw value from a `data-value` attribute (or `<time datetime>`) when the displayed text is formatted, for example `12,104` or `$1.2k`.
* Declare the type per column with `data-type` rather than guessing from content.
* `Array.prototype.sort` is stable, so equal rows keep their previous relative order.

```javascript
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

function sortRows(rows, index, type, direction) {
  const factor = direction === 'ascending' ? 1 : -1;
  // Prefer the raw value when the displayed text is formatted.
  // This reads the DOM on every comparison; for large tables, read each row's value once before sorting.
  const value = (row) => row.cells[index].dataset.value ?? row.cells[index].textContent.trim();
  return rows.sort((a, b) =>
    factor * (type === 'number' ? value(a) - value(b) : collator.compare(value(a), value(b)))
  );
}
```

## Reorder the existing rows

**MANDATORY:** Move the existing `<tr>` elements within the `<tbody>`. Do not rebuild the table or `<tbody>` with `innerHTML` or a re-render: that discards focus and state inside rows and breaks view transitions, which match old and new elements by identity. Never move the header row.

```javascript
// Moving every row to the end in sorted order is enough; no need to compute minimal moves.
function reorder(container, orderedRows) {
  for (const row of orderedRows) container.moveBefore(row, null);
}
```

**DO NOT** fake the order with CSS `order`; DOM order must match visual order for keyboard and screen reader users.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/sortable-table.md#L1-L83). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
