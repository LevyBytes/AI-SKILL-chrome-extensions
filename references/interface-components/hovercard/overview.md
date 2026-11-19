```yaml
---
name: hovercard
description: Build a hovercard component that displays an interactive structured preview of the page a certain type of link (e.g. a user profile) will navigate to when hovered over.
web-feature-ids:
  - popover
  - popover-hint
  - anchor-positioning
  - interest-invokers
  - cross-document-view-transitions
  - blocking-render
  - link-rel-expect
guides:
  - interest-triggered-tooltips
  - consistent-cross-document-transitions
  - cross-document-transitions
---
```

# Build an interactive hovercard

Hovercards provide an interactive preview of content when a user expresses interest in a link (via hover or focus). This is shown to users before they navigate, and either provides the user with the content they need or helps verify that the link will contain the content they are looking for.

If you need plain-text, non-interactive tooltips rather than structured link previews, see {{ GUIDE_REF("interest-triggered-tooltips") }}.

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

{{ FEATURE("interest-invokers", "accessibility") }}

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


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/hovercard/guide.md#L1-L66). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
