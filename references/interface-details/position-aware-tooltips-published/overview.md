Related section: [4. Styling the container itself](styling-container-itself.md).
# Position Aware Tooltips

When building tooltips or popovers with CSS Anchor Positioning, the browser can automatically "flip" the element to a fallback position if it would otherwise overflow the viewport. When this happens, you may want to adjust the style of the positioned content, for instance to reposition an arrow that points from the positioned content to the anchor.

**Anchored Container Queries** solve this by allowing you to query the active positioning state of an element and apply styles accordingly. For general anchored dropdown and flyout positioning with viewport collision flipping (without directional arrow restyling), see `viewport-aware-dropdowns` (via `npx -y modern-web-guidance@latest retrieve "viewport-aware-dropdowns"`).

## The problem

Imagine a tooltip that appears above its anchor by default. It has a "down" arrow at the bottom. If the user scrolls and the tooltip flips to appear *below* the anchor, the arrow is now pointing the wrong way and is on the wrong side of the tooltip.

## The solution: Anchored Container Queries

By setting `container-type: anchored` on your positioned element, you turn it into a query container that knows about its own anchor-positioned state. You can then use the `@container anchored()` query to update its descendants or pseudo-elements.

### 1. Create the tooltip and trigger

Use the Popover API to create a tooltip. Invoking the popover via `popovertarget` automatically establishes an **implicit anchor connection** with the trigger button, so no explicit `anchor-name` or `position-anchor` is required.

```html
<button popovertarget="tooltip" id="anchor" aria-describedby="tooltip">anchor</button>
<div id="tooltip" popover role="tooltip"></div>
```

Reset the popover inset and margin styles for use with anchor positioning, but only if anchor positioning is supported.

```css
@supports (anchor-name: --my-anchor) {
  [popover] {
    inset: auto;
    margin: unset;
  }
}
```

### 2. Set up the container

Apply `container-type: anchored` to the element being positioned. This element must also have `position-try-fallbacks` defined to enable the flipping behavior.

```css
#tooltip {
  position: fixed;
  position-area: block-start;
  position-try-fallbacks: flip-block;

  /* Enable anchored container queries */
  container-type: anchored;
}
```

### 3. Style based on the fallback

Use `@container anchored(fallback: <value>)` to apply styles when a specific fallback is active.

Like all container queries, `@container` can only style **descendants** of the container. A common strategy to create the arrows is with the `::before` and `::after` pseudo-elements, which are treated as descendants and can be styled directly. However, to style the tooltip itself (as seen in step 4), we will add a child element to the tooltip, and create the arrow in its `::before` pseudo-element.

```html
<div id="tooltip" popover role="tooltip">
  <div class="tooltip-content">Tooltip</div>
</div>
```

```css
.tooltip-content::before {
  /* Default "down" arrow for the 'top' position */
  content: "▼" / "";
  position: absolute;
  inset-block-end: 0;
  inset-inline-start: 1rem;
}

/* Update to an "up" arrow when the 'flip-block' fallback (bottom) is active */
@container anchored(fallback: flip-block) {
  .tooltip-content::before {
    content: "▲" / "";
    inset-block-start: 0;
    inset-block-end: auto;
  }
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-atoms/position-aware-tooltips.md#L1-L80). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
