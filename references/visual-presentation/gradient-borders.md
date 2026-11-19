```yaml
---
name: gradient-borders
description: Create continuous gradient borders around an element, with a transparent content area and optionally an animation
draft: stub
web-feature-ids:
  - background-clip-border-area
  - background-clip
  - masks
  - registered-custom-properties
---
```

# Gradient Borders

## Implementation notes for guide authors

- Core guidance: `background-clip: border-area`
- Animation: When to animate vs when not to. Resources worth checking:
	- https://web.dev/articles/css-border-animations
	- https://codepen.io/web-dot-dev/pen/BarmdyM?editors=0110
- Fallback:
	- If content bg doesn't have to be transparent, just `linear-gradient(<color>)` with `background-clip: padding-box` over the gradient
	- If content bg has to be transparent, masked pseudo-element (very briefly, agents know this just fine, just reference it)

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/visual-design/gradient-borders/guide.md#L1-L22). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
