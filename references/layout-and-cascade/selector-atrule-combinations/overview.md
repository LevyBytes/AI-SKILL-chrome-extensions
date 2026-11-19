Related section: [2. Key on the custom property for applied rules](key-on-custom-property-applied-rules.md).
```yaml
---
name: selector-atrule-combinations
description: Target elements based on the intersection or union of selectors and conditional @-rules while minimizing repetition.
web-feature-ids:
  - container-style-queries
---
```

# Selector & @-rule Combinations

## The problem

We often need to combine filtering criteria of different types, e.g. selectors + media queries, media queries + container queries, and so on.

For example, combining `(prefers-color-scheme: dark)` with a selector that targets color scheme overrides (e.g. `:root:has(> head > meta[name="color-scheme"][content="dark"])` or `:root.dark`) to apply certain styles in light/dark mode regardless of how the color scheme was set.

The naive approach leads to duplicated code:

```css
/* Light mode styles */
.card.featured {
  font-weight: 400;
}

#logo-dark {
  display: none;
}

@media (prefers-color-scheme: dark) {
  /* Dark mode styles */
  :root:not(.light) {
    .card.featured {
      font-weight: 300;
    }

    #logo-dark {
      display: inline;
    }

    #logo {
      display: none;
    }
  }
}

/* Dark mode styles, again */
:root.dark {
  .card.featured {
    font-weight: 300;
  }

  #logo-dark {
    display: inline;
  }

  #logo {
    display: none;
  }
}
```

## What to do instead

Store the result of the combined filter on a custom property, then use container style queries to set rules based on that property.

IMPORTANT: Due to how container queries work, this technique only works if we can set the custom property on an ancestor of any rules that must be matched.

### 1. Decouple selection logic from applied rules

```css
:root {
  --color-scheme: light;

  @media (prefers-color-scheme: dark) {
    --color-scheme: dark;
  }

  &:has(> head > meta[name="color-scheme"][content="dark"]) {
    --color-scheme: dark;
  }

  &:has(> head > meta[name="color-scheme"][content="light"]) {
    --color-scheme: light;
  }
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/css/selector-atrule-combinations/guide.md#L1-L86). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
