Related section: [Sortable table](overview.md).
## Reorder the existing rows

**MANDATORY:** Move the existing `<tr>` elements within the `<tbody>`. Do not rebuild the table or `<tbody>` with `innerHTML` or a re-render: that discards focus and state inside rows and breaks view transitions, which match old and new elements by identity. Never move the header row.

```javascript
// Moving every row to the end in sorted order is enough; no need to compute minimal moves.
function reorder(container, orderedRows) {
  for (const row of orderedRows) container.moveBefore(row, null);
}
```

**DO NOT** fake the order with CSS `order`; DOM order must match visual order for keyboard and screen reader users.

## Optionally animate the reorder

Animation is an enhancement; the sort works without it. For when to animate, reduced-motion handling and rapid-click behavior, see {{ GUIDE_REF("dynamic-sort") }}. Skip it for large tables.

```css
tbody tr {
  /* Derives a unique name from each row's identity. */
  view-transition-name: match-element;
}

@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none;
  }
}
```

```javascript
// Scoped to the table so the rest of the page stays interactive during the animation.
function reorderWithTransition(rows) {
  table.startViewTransition(() => reorder(tbody, rows));
}
```

* **DO NOT** put `aria-live` on the table: it would announce every moved row. Use the single `role="status"` element instead, hidden visually (not with `display: none`) using `clip-path: inset(50%)` and a 1px size.

## Narrow screens

Wrap the table in a horizontally scrollable container (`overflow-x: auto`) with `role="region"`, an accessible name from the caption via `aria-labelledby`, and `tabindex="0"` so keyboard users can scroll it. Give the table a `min-inline-size` so columns do not collapse.

## Common mistakes

* **DO NOT** re-render the `<tbody>` or `<table>` on sort; it discards focus and state and breaks view transitions.
* **DO NOT** put `aria-live` on the table, or announce each row.
* **DO NOT** leave `aria-sort` on more than one header.
* **DO NOT** change the button's label to describe the action ("Sort ascending"). Keep the column name; `aria-sort` conveys state.
* **DO NOT** sort formatted strings when the underlying values are numbers or dates.

## Fallbacks

{{ BASELINE_STATUS("invoker-commands") }}

If your Baseline target does not support invoker commands, add a `click` listener to each header button that runs the same sort function. Behavior is identical. The buttons do nothing without JavaScript either way, so add them from script if the table must stay fully readable without it.

{{ BASELINE_STATUS("view-transitions-element-scoped") }}

{{ BASELINE_STATUS("move-before") }}

If your Baseline target does not support `moveBefore()` or element-scoped view transitions, follow the fallbacks in {{ GUIDE_REF("dynamic-sort") }}; the table still sorts and the announcement is unchanged.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/sortable-table/guide.md#L86-L150). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
