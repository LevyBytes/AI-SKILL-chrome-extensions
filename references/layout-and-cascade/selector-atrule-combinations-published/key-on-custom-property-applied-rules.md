Related section: [Selector atrule combinations](overview.md).
### 2. Key on the custom property for applied rules

```css
@container not style(--color-scheme: dark) {
  .card.featured {
    font-weight: 400;
  }

  #logo-dark {
    display: none;
  }
}

@container style(--color-scheme: dark) {
  .card.featured {
    font-weight: 300;
  }

  #logo {
    display: none;
  }
}
```

### 3. OPTIONAL: Utility classes for toggling visibility

A very common case is toggling visibility based on whether the criteria match.
Utility classes must win over arbitrary component styles (hence `!important`) and their shown `display` is unknown, so they can't use overrides — gate them with `not style(...)`:

```css
@container not style(--color-scheme: dark) {
  .if-dark {
    display: none !important;
  }
}

@container not style(--color-scheme: light) {
  .if-light {
    display: none !important;
  }
}
```

## Fallbacks

Baseline status for Container style queries: Newly available. It's been Baseline since 2026-05-19.
Supported by: Chrome 111 (Mar 2023), Edge 111 (Mar 2023), Firefox 151 (May 2026), and Safari 18 (Sep 2024).

There are two types of fallbacks, depending on how critical the branching is and what constitutes an acceptable fallback.

1. For critical branching, where all states must work correctly even if style queries are not supported, you simply cannot use style queries.
Instead, use the naive approach above, duplicating rules for each state.
Utility classes can still be used, as long as they are also defined that way.
2. For non-critical branching, where a default state is acceptable, you can define the base styles outside of any `@container` rule, and only use style queries as overrides.
This preserves most of the spirit of this approach, its main downside being the coupling of values that overrides introduce.

```css
#logo-dark {
  display: none;
}

@container style(--color-scheme: dark) {
  #logo-dark {
    display: inline; /* override */
  }

  #logo {
    display: none;
  }
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/css/selector-atrule-combinations.md#L80-L150). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
