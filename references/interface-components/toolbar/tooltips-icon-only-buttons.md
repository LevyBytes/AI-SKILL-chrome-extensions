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

{{ FEATURE("interest-invokers", "accessibility") }}

{{ FEATURE("interest-invokers", "timing") }}

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

Add a trailing "More actions" menu when the toolbar has secondary actions or must fit narrow containers; skip it if every control is common and fits. If items must move into the menu dynamically as space runs out, build that overflow behavior yourself. {# PENDING_GUIDE_REF: For moving overflowed controls into the popup dynamically as space runs out, see {{ GUIDE_REF("overflow-popup") }}. #}

* Make the trigger the last toolbar item (`aria-label="More actions"`, `aria-haspopup="menu"`, `aria-expanded="false"`, and `popovertarget` pointing at the menu popover) with the conventional three vertical dots icon (`⋮`). Open it only on activation—never preview on focus when arrowing across the toolbar.
* Anchor the `popover` container to its trigger (`inset: auto; position-area: block-end span-inline-start; position-try-fallbacks: flip-block, flip-inline`) and nest `<div focusgroup="menu nomemory" aria-label="More actions">` inside it, adding `role="menu"`, `role="menuitem"`, `tabindex="-1"`, and `ArrowDown`/`ArrowUp`/`Home`/`End` only when `'focusGroup' in HTMLElement.prototype` is false. Sync `aria-expanded` and focus the first item on `toggle`, close the popover on `Tab` without trapping focus, and let `Space` on `role="menuitemcheckbox"` toggle `aria-checked` without closing. For nested submenus or radio groups, see {{ GUIDE_REF("menu") }}.
* Announce the result of every menu activation in the toolbar's live region, such as `"Strikethrough on"` or `"Formatting cleared"`. When closing the menu returns focus to the trigger, delay the live-region write slightly—for example `500ms`—so the focus-change announcement does not preempt it.

## Fallback strategies

### Fallbacks & browser support for `focusgroup`

{{ BASELINE_STATUS("focusgroup") }}

Keep `focusgroup` in the markup. Only if `'focusGroup' in HTMLElement.prototype` is false, load a roving-tabindex fallback; never install it when native focusgroup is present. The fallback implements what focusgroup does natively:

* The active item has `tabindex="0"`; all others have `tabindex="-1"`. Initially the first item is active.
* On `focusin`, move `tabindex="0"` to the focused item so returning to the toolbar (including after a click) restores position.
* In a horizontal toolbar, `ArrowRight`/`ArrowLeft` move to the next/previous item across all groups and wrap at the ends. In RTL, reverse the directions. Do not wire `ArrowUp`/`ArrowDown`.
* In a vertical toolbar, `ArrowDown`/`ArrowUp` move to the next/previous item instead, and `ArrowLeft`/`ArrowRight` do nothing.
* `Home`/`End` move to the first/last item.
* Call `preventDefault()` only for keys the toolbar handles so `Tab` keeps working.

```js
if (!('focusGroup' in HTMLElement.prototype)) {
  // items = every toolbar control across all groups, in DOM order
  items.forEach((b, i) => (b.tabIndex = i ? -1 : 0));
  bar.addEventListener("focusin", ({ target }) => {
    if (items.includes(target)) items.forEach((b) => (b.tabIndex = b === target ? 0 : -1));
  });
  // Read direction and orientation at event time so runtime changes are honored
  const vertical = bar.getAttribute("aria-orientation") === "vertical";
  // Only horizontal toolbars flip with direction: RTL does not flip Up/Down
  const rtl = getComputedStyle(bar).direction === "rtl";
  const steps = vertical
    ? { ArrowDown: 1, ArrowUp: -1 }
    : { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 };
  // keydown: look up steps[key] (or Home/End), move focus, preventDefault only for handled keys
}
```

### Fallbacks & browser support for Interest invokers

{{ BASELINE_STATUS("interest-invokers") }}

Do not load an `interestfor` polyfill here: when native interest invokers or anchor positioning are missing, the upgrade script is skipped and buttons keep their baseline `title` tooltip.

{{ FEATURE_FALLBACKS("popover") }}

### Fallbacks & browser support for `popover="hint"`

{{ BASELINE_STATUS("popover-hint") }}

The popover polyfill does not add `popover="hint"`. Where `popover` exists without `hint`, two tooltips can stay open at once (for example one opened by focus and one by hover). Treat this as graceful degradation: the upgrade only runs where interest invokers are supported, and other browsers keep the native `title` tooltip.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/toolbar/guide.md#L92-L184). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
