```yaml
---
name: tabs
description: "Build a responsive tabbed interface with good UX when not all tabs fit on screen."
web-feature-ids:
  - focusgroup
  - hidden-until-found
  - scroll-snap
  - scroll-driven-animations
  - interpolate-size
guides:
  - anchor-positioning-tab-underline
  - search-hidden-content
  - scrollability-affordance-hints
  - overflow-popup
  - menu
  - single-line-overflow
---
```

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


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/tabs/guide.md#L1-L80). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
