# Build an interactive hovercard

Hovercards provide an interactive preview of content when a user expresses interest in a link (via hover or focus). This is shown to users before they navigate, and either provides the user with the content they need or helps verify that the link will contain the content they are looking for.

If you need plain-text, non-interactive tooltips rather than structured link previews, see `interest-triggered-tooltips` (via `npx -y modern-web-guidance@latest retrieve "interest-triggered-tooltips"`).

## 1. Triggering the hovercard

Use the **Interest Invokers** API to trigger the hovercard. This ensures the card appears on both hover and focus.

- Add the `popover="hint"` attribute to your card container. Use `hint` to avoid closing unrelated popover menus that may be open.
- Add the `interestfor` attribute to the trigger link, pointing to the card's `id`.

```html
<a href="/article" interestfor="article-preview">Article title</a>

<!-- The `id` must match the `interestfor` value on the trigger. -->
<div id="article-preview" popover="hint" class="hovercard">
  <h2>The buzz on hummingbirds</h2>
  <p class="byline">By Delphi Aguilar</p>
  <div>
    <img src="bird.jpg" alt="A vibrant hummingbird">
    <p>Brief summary of the article...</p>
  </div>
</div>
```

You do not need to include an additional link to the content inside of the hovercard, as it is redundant to the triggering link.

### Accessibility

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

> [!IMPORTANT]
> Only use hovercards to provide supplemental information (e.g. a preview of information that can otherwise be obtained by clicking on the link), never information that is not available in any other way.

## 2. Positioning with Anchor Positioning

Position the hovercard relative to its trigger using **CSS Anchor Positioning**. When using `interestfor`, the trigger becomes an implicit anchor for the popover.

```css
[popover].hovercard {
  /* Position the card below the trigger, aligned with its inline-start edge
     and spanning toward the inline-end, flipping if it overflows the viewport. */
  position-area: block-end span-inline-end;
  position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/hovercard.md#L1-L75). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
