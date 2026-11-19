Related section: [Sortable table](overview.md).
## Optionally animate the reorder

Animation is an enhancement; the sort works without it. For when to animate, reduced-motion handling and rapid-click behavior, see `dynamic-sort` (via `npx -y modern-web-guidance@latest retrieve "dynamic-sort"`). Skip it for large tables.

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

Baseline status for Invoker commands: Newly available. It's been Baseline since 2025-12-12.
Supported by: Chrome 135 (Apr 2025), Edge 135 (Apr 2025), Firefox 144 (Oct 2025), and Safari 26.2 (Dec 2025).

If your Baseline target does not support invoker commands, add a `click` listener to each header button that runs the same sort function. Behavior is identical. The buttons do nothing without JavaScript either way, so add them from script if the table must stay fully readable without it.

Browser support for Element-scoped view transitions: Limited availability.
Supported by: Chrome 147 (Apr 2026) and Edge 147 (Apr 2026).
Unsupported in: Firefox and Safari.

Browser support for moveBefore(): Limited availability.
Supported by: Chrome 133 (Feb 2025), Edge 133 (Feb 2025), and Firefox 144 (Oct 2025).
Unsupported in: Safari.

If your Baseline target does not support `moveBefore()` or element-scoped view transitions, follow the fallbacks in `dynamic-sort` (via `npx -y modern-web-guidance@latest retrieve "dynamic-sort"`); the table still sorts and the announcement is unchanged.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/sortable-table.md#L84-L140). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
