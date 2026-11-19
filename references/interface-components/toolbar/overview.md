```yaml
---
name: toolbar
description: Build a toolbar component that displays a set of controls for performing actions.
web-feature-ids:
  - popover
  - interest-invokers
  - popover-hint
  - anchor-positioning
  - async-clipboard
  - forced-colors
  - focus-visible
  - prefers-reduced-motion
  - logical-properties
  - focusgroup
guides:
  # - overflow-popup
  # - navbar
  - icons
  - menu
---
```

# Build a toolbar

A toolbar groups related controls (formatting, alignment, view options) into one composite widget with a **single tab stop**. Users `Tab` into it once, move between controls with the arrow keys, and `Tab` out. Use it only for controls that act on something else (an editor, preview, canvas). For site navigation, see {{ GUIDE_REF("navbar") }}; for a dropdown or context menu of commands without a persistent row of controls, see {{ GUIDE_REF("menu") }}.

## Structure and semantics

MANDATORY: Put `role="toolbar"` and an `aria-label` on the container. Wrap related controls in `role="group"` with their own `aria-label`, and divide groups with `role="separator"` and `aria-orientation="vertical"`. If a wrapped separator would sit alone at a row end, hide it visually with `opacity: 0`, not `display: none` or `visibility: hidden`, which also remove it from the accessibility tree. Optionally add `aria-controls` pointing at the element the toolbar acts on; it is only worth adding when the toolbar controls one specific element.

* Use real `<button type="button">` elements.
* Icon-only buttons need an `aria-label`; tooltips do not replace it. Render decorative icons with `<svg aria-hidden="true">` and `currentColor`, or with a CSS `mask`, `background-color: currentColor`, and `forced-color-adjust: none` so forced-colors mode does not strip the fill. For a reusable CSS icon token system, see {{ GUIDE_REF("icons") }}.
* Toggle buttons (bold, italic) use `aria-pressed="true|false"`. Do not change their label when toggled.
* A mutually exclusive set (left/center/right) uses `aria-pressed` on each button, with script keeping exactly one `true`.
* Action buttons (copy, undo, save) run once and have no on/off state, so DO NOT add `aria-pressed` to them. Mark `aria-pressed` only on buttons that stay on or off.
* Disable with `aria-disabled="true"` rather than `disabled` so the control stays focusable and reachable by arrow keys. Ignore clicks while it is set.

```html
<div role="toolbar" focusgroup="toolbar wrap" aria-label="Text formatting" aria-controls="preview">
  <div role="group" aria-label="Style">
    <button type="button" aria-pressed="false" aria-label="Bold" title="Bold"></button>
  </div>
  <span role="separator" aria-orientation="vertical"></span>
  <!-- Overflow trigger: the last item in the toolbar -->
  <button type="button" aria-label="More actions" aria-haspopup="menu" aria-expanded="false"
    popovertarget="more-menu" title="More actions"></button>
</div>
```

## Action buttons and feedback

Toggles show their result through `aria-pressed`. An action has no state to show, so a screen reader user gets no confirmation unless you provide it. When the result is not otherwise visible or announced (copy, save), write a short message to a live region outside the toolbar. If the action changes content that is already announced or focused, skip the message.

```html
<!-- Always present in the DOM so the announcement is reliable; keep it outside the toolbar -->
<p role="status"></p>
```

```js
// Report the outcome, including failure; clipboard access can be denied
try {
  await navigator.clipboard.writeText(text);
  status.textContent = "Text copied";
} catch {
  status.textContent = "Copy failed";
}
```

## Keyboard navigation

MANDATORY: Only one item is in the tab order at a time. Put `focusgroup="toolbar wrap"` on the `role="toolbar"` container: the browser provides the roving tab stop, arrow-key movement across all groups (wrapping at the ends, reversed in RTL), `Home`/`End`, and focus restoration after a click. Do not add a second roving-tabindex system alongside it. Where `focusgroup` is unsupported, install the fallback in "Fallbacks" below.

## Vertical toolbar

Choose a vertical toolbar when controls stack along a side edge (a tool palette or zoom controls beside a canvas); otherwise use a horizontal one. Everything above applies except:

* Set `aria-orientation="vertical"` on the toolbar and use `focusgroup="toolbar wrap block"` so `ArrowDown`/`ArrowUp` move between items.
* Lay items out in a column (`flex-direction: column`, no wrapping).
* A separator between stacked items is horizontal: use `aria-orientation="horizontal"` (the separator default) there, not `vertical`.
* Tooltips open beside the button (`position-area: inline-end`), not below it; see Tooltips below.

## Visible states

* Size each button at least 24×24 CSS px using `min-inline-size`/`min-block-size` (not `inline-size`/`block-size`), so content can grow the target but never shrink it. Enlarge it under `@media (pointer: coarse)`. Values like `2.5rem` and `3rem` are examples.

* Keep a clear `:focus-visible` outline with an offset; never remove it.
* Style toggled state from the ARIA attribute (`[aria-pressed="true"]`), not a separate class, so visual and accessible state cannot diverge.
* Show the toggled state by changing the button background; if the contrast between the button background and the adjacent background color is less than 3:1 in each supported color scheme, provide an additional visual cue such as an outline or inset shadow around the background that meets the 3:1 threshold. For more information, see {{ GUIDE_REF("color") }}.
* Under `forced-colors: active`, use system colors (`ButtonText`, `Highlight`).
* Draw separators and tooltip boxes with a border (a `transparent` one is fine), not `background` alone, which forced colors replaces with the page color.
* Wrap hover styles in `@media (hover: hover)` and transitions in `@media (prefers-reduced-motion: no-preference)`.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/toolbar/guide.md#L1-L91). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
