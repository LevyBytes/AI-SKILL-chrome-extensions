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

{{ BASELINE_STATUS("container-style-queries") }}

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

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/css/selector-atrule-combinations/guide.md#L87-L156). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
