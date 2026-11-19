Related section: [Card](overview.md).
### Clickable cards with independent actions

If clicking the card triggers an action rather than navigating, use a `<button>` instead of a link.

When a content card links to a primary destination, also contains other interactive elements, and needs to be clickable as a whole:
- Use a single opt-in, on the primary link itself: put `.card-link` on exactly one link per card (the heading link). Footer and other links never get it, or each would stretch its own overlay and the last one would capture the whole card.
- Link its title and stretch the pointer hit area across the card with `::after`

```css
.card:has(a.card-link) {
	position: relative;
}

.card a.card-link::after {
	content: "";
	position: absolute;
	inset: 0;
}
```

- Elevate interactive elements with `position: relative; z-index: 1` so they remain operable. Target types of elements (e.g. `a, button`) rather than requiring opt-in via classes. 
- Do NOT apply `z-index` to entire containers as that would make them capture pointer events that don't produce any action.

```css
.card:has(a.card-link) {
	/* Keep other interactive elements above the overlay */
	a:not(.card-link), button, input, x-button {
	    position: relative;
	    z-index: 1;
	}
}
```

- Style the card itself on hover/focus, rather than the stretched link:

```css
.card {
	a.card-link {
		&:focus-visible {
			outline: none; /* Draw it on the card instead */
		}
	}
	
	&:has(a.card-link:focus-visible) {
		/* Focus ring */
	}

	&:has(a.card-link:hover) {
		/* Hover styles */
	}
}

```

### Choice cards

For cards that represent predefined choices, use `<label class="card">` with a checkbox or radio as a direct child.

Style the selected card with `:has(:checked)`. Never change layout-affecting properties such as `border-width`, `padding`, or `font-weight` on selection, because the card and its neighbors jump; draw the emphasis with `outline`, `box-shadow`, or a transparent border that only changes color:

```css
.card {
  border: 2px solid transparent;

  &:has(> :checked) {
    border-color: var(--accent);
  }
}
```

The visible checkbox or radio is itself a non-color indicator of selection, so the color change alone is sufficient. If the control is visually hidden (keep it focusable and in the accessibility tree, never `display: none`), add a non-color indicator that does not affect layout, such as a check icon or a thicker `outline`.

When choices belong in a dropdown picker whose options are laid out as cards, use a native `<select>` with `appearance: base-select` and style `::picker(select)` and `<option>` elements rather than replacing the select with `<div>` cards; see `custom-select-picker-layouts` (via `npx -y modern-web-guidance@latest retrieve "custom-select-picker-layouts"`) for more details and fallbacks.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/card.md#L60-L132). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
