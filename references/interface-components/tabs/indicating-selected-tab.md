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

To animate the underline between tabs, move the pseudo-element to the tablist and tether it to the selected tab with anchor positioning. See {{ GUIDE_REF("anchor-positioning-tab-underline") }} for details.


- DO NOT put padding, borders, margins, or backgrounds on the panel element itself. `hidden=until-found` does not use `display: none`: it only hides the panel's contents, so a hidden panel still renders its padding, border, margin, and background as an empty strip. Put these styles on a child wrapper inside the panel instead.
- `hidden=until-found` panels still participate in grid and flex layout, so `gap` adds space for every hidden panel. Place all panels in the same grid cell, or avoid `gap` between panels.

See {{ GUIDE_REF("search-hidden-content") }} for more details.

## Handling tabs that don’t fit

Keep tabs on a single row. DO NOT wrap them onto multiple rows: wrapped rows make the tab order and the selected tab hard to follow.
When the tabs are wider than the available space, either scroll the tablist or move the tabs that don’t fit into a popup menu.
Optionally, also shrink the inactive tabs, so more tabs fit before either kicks in.

1. **Scrolling** keeps every tab in the tablist and in the keyboard order, and works with touch swiping. It needs no script beyond selection. Use it by default, and always on touch-first interfaces.
2. **An overflow menu** shows the names of all hidden tabs at once, in a list, without scrolling. Use it when there are a few primary tabs and a tail of less used ones, and users mostly use a pointer. It needs script to detect overflow.
3. **Shrinking inactive tabs** truncates their labels, so it suits tabs the user creates (e.g. open documents in an editor) better than a fixed set of tabs with short labels. Combine it with scrolling or an overflow menu.

### Strategy 1: scrolling

1. Make the tablist a horizontal scroll container: `display: flex`, `overflow-x: auto`, and `flex: none` on the tabs so they never shrink (unless combined with strategy 3).
2. Optional: snap to tab edges with `scroll-snap-type: inline proximity` on the tablist and `scroll-snap-align: start` on the tabs. Use `proximity`, not `mandatory`, so the user can still stop between tabs.
3. Hide the scrollbar and fade out each edge of the tablist that has more tabs beyond it, as described below. A fade suits a row of tabs better than a shadow, and works on any background. See {{ GUIDE_REF("scrollability-affordance-hints") }} for more details on scrollability hints.
4. On every selection change, scroll the selected tab into view with `scrollIntoView({ block: 'nearest', inline: 'nearest', container: 'nearest' })`. `container: 'nearest'` scrolls only the tablist, not the page. Clicking a partially visible tab then reveals it along with part of the next one, so mouse users without a horizontal scroll wheel can still reach every tab. It also covers selection without focus, such as find-in-page.

#### Fading the edges

{{ INCLUDE("../../ui-atoms/scrollability-affordance-hints/guide.md#fades") }}


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/tabs/guide.md#L81-L135). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
