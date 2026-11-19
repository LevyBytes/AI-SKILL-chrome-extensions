Related section: [Optional: blur the end of the faded text](optional-blur-end-faded-text.md).
```yaml
---
name: teaser
description: Fade out or blur the end of hard-truncated or payment-walled content so that it blends into the background behind it.
web-feature-ids:
  - masks
  - lh
  - backdrop-filter
  - line-clamp
---
```

# Teaser

## Overview

To fade out the end of a container's content (e.g., a teaser for payment-walled text), use CSS Masking with a linear gradient, NOT a semi-transparent overlay which imposes design constraints on the background and interaction.

- This is for content that is truncated at the source, not just presentationally via CSS. To hint that a scroll container has more content to scroll to, see {{ GUIDE_REF("scrollability-affordance-hints") }} instead. For a few lines of plain text that only need an ellipsis, use `line-clamp` instead.
- This is for block content. For handling single line overflow, see {{ GUIDE_REF("single-line-overflow") }}.

## Choosing a treatment

- Use a **fade** when the content continues elsewhere.
- Add a **blur** on top of the fade for payment-walled content, where the reader should see that there is more text but not be able to read it.

A mask or blur only changes how the content is painted. The content is still in the DOM, the accessibility tree, find-in-page, and copy and paste.

- DO NOT leave links or controls in the faded part: they stay focusable while they are unreadable.
- Put the call to action (e.g. a subscribe button) after the masked element, not inside it, so it is not faded too.

## Fading the end of the teaser

```css
.teaser {
  /* Size the fade in lines (3lh is an example value), not as a percentage:
     a percentage grows with the content, so a long excerpt would be mostly faded */
  mask-image: linear-gradient(to top, transparent, black 3lh);
}
```

- If CSS cuts the excerpt off instead of the markup, limit it with `max-block-size` and `overflow: clip`, so the teaser does not become a scroll container. The same mask applies.
- For vertical writing modes, point the gradient in the block direction (`to left` for `vertical-rl`, `to right` for `vertical-lr`). Do not repeat the entire gradient; instead set a CSS variable with the direction.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/visual-design/teaser/guide.md#L1-L42). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
