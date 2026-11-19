### Strategy 2: overflow menu

Hide the tabs that don’t fit and list them in a menu opened by a “More” button after the tablist.
Build the button and its menu as a menu button; see `menu` (via `npx -y modern-web-guidance@latest retrieve "menu"`) for structure, positioning, and keyboard behavior.
The rest of this section covers only what is specific to tabs.

- **Place the “More” button outside the tablist.** A tablist may only contain tabs. This makes it a separate `Tab` stop that arrow keys do not reach. If arrow-key access matters more, move focus from the last visible tab to the “More” button on `ArrowRight`/`End`, and back on `ArrowLeft`. The tablist itself does nothing at its last tab, so this does not conflict with it, but it is custom key handling that users of the tab pattern may not expect.
- **Make the “More” button look different from a tab.** Use an icon (such as a horizontal ellipsis) with an accessible name, not a text label: a text label looks like one more tab.
- **Detect overflow with `IntersectionObserver`**, rooted at the tablist with `threshold: 1`, so partially visible tabs count as overflowed. It reports each tab as it starts or stops fitting, with no layout math.
- **Hide overflowed tabs with `visibility: hidden`**, not `display: none` or `hidden`. They keep their layout box, so the observer still reports when they fit again, and they leave the focus order and the accessibility tree. Set `overflow: clip` on the tablist so they don’t overflow the page.
- **Mirror each tab as a `menuitem`**. Show only the items whose tab is hidden. Activating an item selects its tab and focuses it. Focus the tab before hiding the popover: otherwise the popover returns focus to the previously focused tab, which selects it again.
- **Hide the “More” button when no tab overflows.** This cannot loop: showing the button only narrows the tablist, so at least one tab still overflows.
- **Keep the selected tab in the tablist.** DO NOT leave it in the menu or mark the “More” button as selected: it is a button, not a tab. When the selected tab overflows (selected from the menu, by find-in-page, or after a resize), set `display: none` on the tabs before it, closest first, until it fits. The observer then reports them as overflowed, so they appear in the menu. DO NOT reorder tabs (in the DOM or with CSS `order`): the removed tabs are gone from both the visual and the focus order, so the two still match. Keep overflowed tabs visible while they are selected or focused: a selected tab can then be focused before the observer catches up, and a focused tab keeps focus when a resize overflows it.

```html
<div class="tabs">
  <div class="tablist" focusgroup="tablist nomemory" aria-label="Product details">
    <button type="button">Overview</button>
    <button type="button">Specifications</button>
    <!-- … -->
  </div>
  <!-- Outside the tablist: a tablist may only contain tabs.
       Icon, not text, so it does not read as another tab. -->
  <button type="button" class="more" hidden aria-label="More tabs" aria-haspopup="menu" aria-expanded="false">⋯</button>
  <!-- Menu: see the menu guide. One menuitem per tab. -->
  <!-- Tab panels -->
</div>
```

```js
const observer = new IntersectionObserver(entries => {
  for (const { target: tab, intersectionRatio } of entries) {
    const overflowed = intersectionRatio < 1;
    // CSS: .clipped:not([aria-selected="true"], :focus) { visibility: hidden; }
    tab.classList.toggle('clipped', overflowed);
    menuItemFor(tab).hidden = !overflowed;
  }
  more.hidden = !tabs.some(tab => tab.classList.contains('clipped'));
  reveal();
}, { root: tablist, threshold: 1 });

tabs.forEach(tab => observer.observe(tab));

// Also call after every selection change.
// CSS: .displaced { display: none; }
function reveal() {
  const tab = tabs.find(tab => tab.ariaSelected === 'true');
  const before = tabs.slice(0, tabs.indexOf(tab));
  tabs.forEach(tab => tab.classList.remove('displaced'));
  while (before.length && !fits(tab)) {
    before.pop().classList.add('displaced');
  }
}

// Checks both edges, so it works in either writing direction
function fits(tab) {
  const list = tablist.getBoundingClientRect();
  const { left, right } = tab.getBoundingClientRect();
  return left >= list.left && right <= list.right;
}
```

### Strategy 3: Making inactive tabs smaller

This may be combined with the overflow handling strategies described above to allow more tabs to fit before scrolling or showing a menu.
It is more well suited to user-driven tablists (e.g. a document editor) rather than hardcoded UI tablists.

- Let inactive tabs shrink and keep the selected tab at its full width: `flex: 0 1 auto` on the tabs, and `min-inline-size: max-content` on the selected tab, which also overrides any `max-inline-size`, so its label is never truncated. DO NOT use `flex-shrink: 0` for this: it cannot transition smoothly (see below).
- Set a `min-inline-size` on the tabs. Once every inactive tab is at its minimum, the remaining overflow is handled by scrolling or the overflow menu.
- Truncate shrunk labels with `text-overflow: ellipsis`. Put the label in its own element, so `overflow: hidden` applies to the text only and an icon beside it is never clipped.
- Keep the full label in the DOM, so the accessible name and find-in-page are unaffected. Reveal it by scrolling the label inside the tab on hover, and on focus when activation is manual (with automatic activation the focused tab is selected, so it is already full width). See `single-line-overflow` (via `npx -y modern-web-guidance@latest retrieve "single-line-overflow"`) for more details.
- If tabs have icons, keep the icon visible and truncate only the label, so a minimum-width tab is still recognizable.
- Transition `min-inline-size` so tabs resize smoothly when the selection changes, instead of jumping. Set `interpolate-size: allow-keywords` on the tablist so it interpolates to and from `max-content`; no view transition is needed. Only transition it when `prefers-reduced-motion` is `no-preference`. Transitioning `flex-shrink` does not work: any value above 0 shrinks a tab all the way to its minimum when the tabs overflow.



## Fallback strategies

### Fallbacks & browser support for focusgroup

Browser support for focusgroup: Limited availability.
Supported by: Chrome 150 (Jun 2026) and Edge 150 (Jul 2026).
Unsupported in: Firefox and Safari.

Load `@microsoft/focusgroup-polyfill` only when native support is missing:

```js
if (!(Object.hasOwn(HTMLElement.prototype, 'focusGroup'))) {
  const { polyfill } = await import('@microsoft/focusgroup-polyfill');
  polyfill();
}
```

- Use the `focusgroup` and `focusgroupstart` attributes, not the `focusGroup` property, which the polyfill does not add.
- The polyfill does not notice items hidden or shown later: add `focusgroup="none"` to an item while it is hidden.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/tabs.md#L173-L268). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
