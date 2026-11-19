## Tooltips for icon-only buttons

Give each icon-only button a `title` as the baseline tooltip. Only where both interest invokers and anchor positioning are supported, upgrade it to an interest invoker with `popover="hint"`, which shows the tooltip without closing an open menu popover. Elsewhere the native `title` tooltip stays.

MANDATORY: Position the hint on the axis the toolbar does not stack along: `position-area: block-end` (fallback `flip-block`) for a horizontal toolbar, `position-area: inline-end` (fallback `flip-inline`) for a vertical one. A hint placed along the stacking axis covers the next control and swallows its click, because the hint stays open while the pointer is over it.

```html
<button type="button" aria-label="Bold" title="Bold">…</button>
```

```js
// Upgrade title tooltips only when interest invokers and anchor positioning both work
if ("interestForElement" in HTMLButtonElement.prototype && CSS.supports("position-area", "block-end")) {
  document.querySelectorAll('[role="toolbar"] button[title]').forEach((b, i) => {
    const tip = Object.assign(document.createElement("div"), { id: `tip-${i}`, textContent: b.title });
    tip.popover = "hint";
    b.setAttribute("interestfor", tip.id);
    b.removeAttribute("title"); // avoid a second, native tooltip
    document.body.append(tip); // keep open hint nodes out of role="group" / role="toolbar"
  });
}
```

`interestfor` is specified to wire hint popovers (`popover="hint"`) for assistive technology itself, based on what the target contains. A **plain hint** (text and images only) becomes the trigger's accessible description, or its name if it has none. A **rich hint** (headings, links, or other interactive content) gets a minimum role of `tooltip`, the trigger gets `aria-expanded` and an `aria-details` relation while the hint is open, and the open hint comes right after the trigger in the tab order so keyboard users can reach its content.

Browsers and screen readers do not yet expose this consistently, so add explicit ARIA as well:

- **Hint that repeats the trigger's accessible name** (e.g. an icon-only button with `aria-label="Bold"` and a "Bold" tooltip): add nothing. A description identical to the name would be read twice.
- **Hint on a trigger with no visible label of its own** (e.g. an icon-only button without `aria-label`): `aria-labelledby` on the trigger pointing at the hint, so the hint becomes the name.
- **Hint whose trigger also opens it on activation** (a toggletip, or any button whose only job is the hint: give it `popovertarget` with `popovertargetaction="show"`): `role="tooltip"` on the hint and `aria-expanded` on the trigger, kept in sync with the popover's `toggle` event. A description read right after "button" suggests further actions and muddles the role; the expanded state tells the user there is content to reveal and whether it is open, and pressing the button delivers it. Place the hint right after the trigger in the DOM so reading keys reach its content once it is open.
- **Hint whose trigger does something else on activation** (a link, a button with its own action): `role="tooltip"` on the hint and `aria-describedby` on the trigger, never `aria-expanded`. A trigger announced as "collapsed" suggests `Enter` would expand it, but `Enter` navigates or acts. The hint must be something the user can afford to miss: a hovercard previews the destination, a tooltip on an action button describes the action.
- **DO NOT** attach a hint that opens on activation to a control that already uses `aria-expanded` for something else (for example, a menu button). Give that hint its own trigger instead.
- **DO NOT** move focus into the target when interest is shown (no `autofocus`, no `focus()` in an `interest` listener). Interest is triggered by hover or focus alone, so moving focus would fail WCAG 3.2.1 (On Focus).

Not every screen reader reads descriptions when moving through the page (NVDA skips them in browse mode by design), so a hint exposed as a description must only carry content the user can afford to miss. Link previews and tooltips on action controls qualify; anything the user needs belongs in a toggletip or inline.

Wire this with a short script instead of hand-authoring the attributes, so the markup stays declarative and the same rules apply to every hint. The script should:

1. Run in every browser, before loading the `interestfor` polyfill, once the DOM is parsed, and expose a function that can be called again for content inserted later. Scanning upfront is required: a browse-mode screen reader user needs the attributes in place before any interaction, so wiring them lazily on `focus` or `interest` is too late, and so is waiting for the polyfill, which wires its ARIA only on `load` and adds no `role="tooltip"` to plain hints.
2. For every `[interestfor]` trigger whose target has `popover="hint"`, normalize whitespace and compare the hint text with the trigger's accessible name (`aria-labelledby` targets, else `aria-label`, else text content including image `alt`, else `title`). Equal: do nothing. Otherwise set `role="tooltip"` on the hint if it has no role.
3. When the trigger has no name, point `aria-labelledby` at the hint unless it already has one. Otherwise, if the trigger also opens the hint on activation (a `popovertarget` or `commandfor` naming the hint), set `aria-expanded` to the popover's current state (`:popover-open`) unless it already has `aria-expanded`, and remember which triggers the script owns; if not, point `aria-describedby` at the hint unless it already has one.
4. Keep `aria-expanded` in sync from the popover's `toggle` event in every browser with a single capturing listener on `document`, updating every trigger with a matching `interestfor` that the script owns (the `interestfor` polyfill does not sync `aria-expanded` on plain-text hints or when a toggletip is opened via `popovertarget`).

Things that are easy to get wrong:

- `toggle` does not bubble. A bubbling listener on `document` never fires; use the capture phase (or a listener per popover).
- Sync `aria-expanded` from `toggle`, not from `interest`/`loseinterest`. The popover is the source of truth: it can be closed by `Escape`, light dismiss, or another invoker, and several triggers can share one hint.
- A hidden popover is a valid `aria-describedby` or `aria-labelledby` target. Do not force the hint open or duplicate its text to make it "visible".
- Do not add `aria-haspopup` or a live region to any hint.
- Do not override author ARIA: an existing `aria-describedby`, `aria-labelledby`, or `aria-expanded` on the trigger wins.

By default, interest is shown and lost for keyboard and mouse users with a delay of half a second. This prevents the targeted popover from opening while tabbing through a page or moving your mouse around, and from closing while moving your mouse from the trigger to the popover. To adjust the timing, use the `interest-delay` CSS property.

```css
[interestfor]{
  /* Shorthand for interest-delay-start and interest-delay-end */
  interest-delay: 0.2s 0.1s;
}
```

If users are likely to move through multiple triggers in quick succession, set the initial delay to `0s` if an interest-triggered popover is already open. To prevent performance issues with `:has()`, select a nearby container with a small number of child nodes, and target the triggers as directly as possible.

```css
.container:has( > li > a:interest-source) [interestfor] {
  interest-delay-start: 0s;
}
```

```css
[popover="hint"] {
  inset: auto;
  /* Anchor to the invoker; flip to the other side if there is no room */
  position-area: block-end;
  position-try-fallbacks: flip-block;
}
```

## Overflow menu for secondary actions (optional)

Two patterns fit a toolbar into a narrow space: an overflow menu, better on desktop, or a horizontally scrollable toolbar with no scrollbar and scroll hints, better on mobile. For the scrollable pattern use `overflow-x: auto; scrollbar-width: none; scroll-snap-type: x proximity`, and hint at hidden controls with edge fades (`mask-image`) or a partly visible last item. Choose by input type (`@media (pointer: coarse)`) or container width.

Add a trailing "More actions" menu when the toolbar has secondary actions or must fit narrow containers; skip it if every control is common and fits. If items must move into the menu dynamically as space runs out, build that overflow behavior yourself.

* Make the trigger the last toolbar item (`aria-label="More actions"`, `aria-haspopup="menu"`, `aria-expanded="false"`, and `popovertarget` pointing at the menu popover) with the conventional three vertical dots icon (`⋮`). Open it only on activation—never preview on focus when arrowing across the toolbar.
* Anchor the `popover` container to its trigger (`inset: auto; position-area: block-end span-inline-start; position-try-fallbacks: flip-block, flip-inline`) and nest `<div focusgroup="menu nomemory" aria-label="More actions">` inside it, adding `role="menu"`, `role="menuitem"`, `tabindex="-1"`, and `ArrowDown`/`ArrowUp`/`Home`/`End` only when `'focusGroup' in HTMLElement.prototype` is false. Sync `aria-expanded` and focus the first item on `toggle`, close the popover on `Tab` without trapping focus, and let `Space` on `role="menuitemcheckbox"` toggle `aria-checked` without closing. For nested submenus or radio groups, see `menu` (via `npx -y modern-web-guidance@latest retrieve "menu"`).
* Announce the result of every menu activation in the toolbar's live region, such as `"Strikethrough on"` or `"Formatting cleared"`. When closing the menu returns focus to the trigger, delay the live-region write slightly—for example `500ms`—so the focus-change announcement does not preempt it.

## Fallback strategies


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/toolbar.md#L71-L159). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
