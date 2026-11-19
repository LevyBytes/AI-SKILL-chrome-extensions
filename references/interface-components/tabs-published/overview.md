# Tabbed interfaces

## Basic markup

Instead of manually implementing a roving tabindex or ARIA activedescendant pattern to meet the focus management requirement of the ARIA `tablist` role, we can use `focusgroup` which has a `tablist` behavior and automatically assigns the right roles (`tablist` on the container and `tab` on its focusable children).

```html
<div class="tabs">
  <div focusgroup="tablist" aria-label="Web platform technologies">
      <button type="button" id="html-tab" aria-selected="true" focusgroupstart>HTML</button>
      <button type="button" id="css-tab">CSS</button>
      <button type="button" id="js-tab">JavaScript</button>
  </div>
  <div role="tabpanel" aria-labelledby="html-tab" tabindex="0"><!-- content for HTML tab --></div>
  <div role="tabpanel" aria-labelledby="css-tab" hidden="until-found"><!-- content for CSS tab --></div>
  <div role="tabpanel" aria-labelledby="js-tab" hidden="until-found"><!-- content for JavaScript tab --></div>
</div>
```

DO NOT use this or the WAI-ARIA tabs pattern for page navigation, even if it is intended to be presented as a tabbed interface.

Tablist:
- Prefer `<button>` for the tabs to avoid needing to reimplement button-like behavior. Add `type=button` to avoid unexpected submitter behavior if nested within a form.
- Use `aria-labelledby` or `aria-label` to give the tablist an accessible name.
- Use `aria-selected` to indicate which tab is currently selected.

Tab panels:
- Set `role=tabpanel` on the tab panels and use `aria-labelledby` or `aria-label` to give the panel an accessible name (e.g. `aria-labelledby` can reference the associated tab).
- Do not add `aria-controls` to the tabs: no screen reader uses it.
- Use `hidden="until-found"` to hide tab panels whose tab is not actively selected while still keeping them searchable by the browser’s find-in-page feature. Use `hidden` with no value to remove the content from the browser's search in-page feature as well.
- When using `hidden="until-found"`, use the `beforematch` event to sync the tab & tab panel selection state when find-in-page makes a different tab active.
- Set `tabindex=0` on the visible tab panel if it contains no focusable elements, and remove it from hidden panels.

- MANDATORY: Render the initial state in the HTML: `hidden` on every panel except the selected one, and `aria-selected="true"` on the selected tab. Otherwise every panel shows until script runs, overlapping when they share a grid cell.

## Keyboard interaction

When it comes to how tabs become selected, one can either make _selection follow focus_ or allow the user to move focus between tabs and perform _selection by activation_.

Default to _selection follows focus_.
It saves a keypress per tab, is more discoverable, and matches native radio groups.
Use selection by activation instead when showing a panel has a cost the user should opt into, since arrowing from the first tab to the fifth would pay it for every tab along the way:
- Showing the panel is not instant: content is fetched on demand, or rendering it is noticeably slow.
- Selecting a tab has side effects: it changes the URL or history, sends analytics, starts media, or saves state.
- The panel shifts the layout significantly (e.g. panels of very different heights push the rest of the page around).

With either pattern, focus entering the group must land on the selected item. By default it returns to the last focused item instead, which is wrong once selection can change without focus (find-in-page, script).
Use `nomemory` and move `focusgroupstart` to the selected tab:

```html
<div focusgroup="tablist nomemory" aria-label="Web platform technologies">
```

```js
for (const tab of tabs) {
  tab.ariaSelected = tab === selected;
  tab.toggleAttribute('focusgroupstart', tab === selected);
}
```

## Styling

### Indicating the selected tab

Style the selected tab from `aria-selected`, so the visual state can never disagree with the accessible one.
Do not apply any styling that changes the dimensions of the tab (e.g., `padding`, `border`, `margin`, `font-size`, `font-weight`, etc).

- MANDATORY: Do not indicate the selected tab with color alone (WCAG 1.4.1). Add a shape, such as an underline.
- Draw the underline with a border on a pseudo-element. DO NOT use `box-shadow` or a background: forced colors mode removes both, leaving no indicator.

```css
[role="tab"] {
  position: relative;
}

[aria-selected="true"] {
  color: var(--accent);

  /* Example: a 3px underline that takes no space */
  &::after {
    content: "";
    position: absolute;
    inset: auto 0 0;
    border-block-end: 3px solid var(--accent);
  }
}
```

To animate the underline between tabs, move the pseudo-element to the tablist and tether it to the selected tab with anchor positioning. See `anchor-positioning-tab-underline` (via `npx -y modern-web-guidance@latest retrieve "anchor-positioning-tab-underline"`) for details.


- DO NOT put padding, borders, margins, or backgrounds on the panel element itself. `hidden=until-found` does not use `display: none`: it only hides the panel's contents, so a hidden panel still renders its padding, border, margin, and background as an empty strip. Put these styles on a child wrapper inside the panel instead.
- `hidden=until-found` panels still participate in grid and flex layout, so `gap` adds space for every hidden panel. Place all panels in the same grid cell, or avoid `gap` between panels.

See `search-hidden-content` (via `npx -y modern-web-guidance@latest retrieve "search-hidden-content"`) for more details.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/tabs.md#L1-L96). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
