## 5 Native overlays, anchor positioning, and stacking contexts

{{ BASELINE_STATUS("dialog") }}
{{ BASELINE_STATUS("popover") }}
{{ BASELINE_STATUS("anchor-positioning") }}

**When to use each overlay primitive:**

- Use `popover` for transient, non-modal UI (flyouts, toasts, tooltips) — lives in the top layer, no `z-index` management needed.
- Use `<dialog>` with `.showModal()` for modal interactions that require focus trapping and an inert backdrop.
- Don't combine `popover` and `.showModal()` on the same element — they're mutually exclusive runtime states.

**Anchor positioning (spatial layout of overlays):**

- Use `position-area` (or `anchor()` on insets) and `anchor-size()` to position and size an overlay relative to its trigger.
- Use `position-try-fallbacks` to let the browser reposition when the overlay overflows the viewport. `flip-block, flip-inline, flip-block flip-inline` is a reasonable default, or define use-case specific fallbacks.
- Don't mix physical and logical keywords in a single `position-area` value — pick one coordinate system.
- Feature-detect with `@supports (anchor-name: --x)` and provide an absolute-position fallback.

> For full implementation detail, polyfill strategies, and `popover` value reference, see {{ GUIDE_REF("declarative-dialog-popover-control") }} and {{ GUIDE_REF("position-aware-tooltips") }}. For anchor positioning applied to dropdowns, flyouts, and tab indicators, see {{ GUIDE_REF("viewport-aware-dropdowns") }} and {{ GUIDE_REF("anchor-positioning-tab-underline") }}.

## 6 Overflow tracking and layout stability

{{ BASELINE_STATUS("scrollbar-gutter") }}
{{ BASELINE_STATUS("line-clamp") }}

Manage layout shifts, scrollbars, and clipping predictably.

**Do:**

- Use `overflow: auto` so scrollbars appear only when content actually overflows.
- Use `overflow: clip` to clip content **without** establishing a scroll container; opt into spillover with `overflow-clip-margin`.
- Use `scrollbar-gutter: stable` to reserve space for scrollbars and prevent layout shifts when content grows.
- Use `overscroll-behavior: contain` (or `none`) on nested scroll regions (such as sidebars, modals, and lists) to stop scroll chains from bubbling into the page, or `overscroll-behavior: chain` on intermediate scroll wrappers (such as swipe-to-reveal tracks) when excess scroll should propagate to an ancestor scroller without triggering a local rubber-band bounce.
- Use the `-webkit-line-clamp` + `display: -webkit-box` + `-webkit-box-orient: vertical` triad for multi-line truncation — despite the prefix, this pattern is fully specified and not deprecated. Declare the unprefixed `line-clamp` shorthand alongside it; browsers that don't yet support it ignore the property harmlessly.
- For text that must stay on one line (labels, table cells, file names) see {{ GUIDE_REF("single-line-overflow") }} for techniques for truncating and revealing the full text on demand without UX friction.

**Do not:**

- Don't use `overflow: scroll` when `auto` will do — `scroll` forces scrollbars even when there's nothing to scroll.
- Don't reach for `overflow: hidden` when you only want to clip — `hidden` establishes a scroll container that can be programmatically scrolled.

```css
.scrollable-list {
  max-block-size: 400px;
  overflow-y: auto;
  scrollbar-gutter: stable;       /* Reserve scrollbar space. */
  overscroll-behavior: contain;   /* No scroll chaining into the page. */
}

.snippet {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-clamp: 3;                  /* Ignored where unsupported. */
  overflow: clip;
}
```

> For `overflow: clip` and `overflow-clip-margin` in depth, see {{ GUIDE_REF("overflow-clipping-control") }}. For nested scroll handoff with `overscroll-behavior: chain` in swipe-to-reveal UI, see {{ GUIDE_REF("swipe-to-reveal") }}. For scrollbar color, sizing, and theming, see {{ GUIDE_REF("customize-scrollbar-color-and-thickness") }}, {{ GUIDE_REF("dark-mode") }}, and {{ GUIDE_REF("adapt-scrollbar-to-contrast-preferences") }}.

## 7 Viewport mechanics and track distribution

{{ BASELINE_STATUS("viewport-unit-variants") }}

- Use `dvh`/`dvw` for mobile layout containers that must account for browser UI shifting (URL bar collapse/expand).
- Don't use `100vw` for full-width layout — it ignores scrollbar width and causes horizontal overflow. Use `100%`, `100dvw`, or `100svw` instead.

> For the responsive design entry point (dynamic viewport units, reserving space for media, fluid typography), see {{ GUIDE_REF("responsive-design") }}.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/css/css-layout/guide.md#L226-L295). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
