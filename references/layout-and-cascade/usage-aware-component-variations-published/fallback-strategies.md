Related section: [Usage aware component variations](overview.md).
## Fallback Strategies

Baseline status for Container style queries: Newly available. It's been Baseline since 2026-05-19.
Supported by: Chrome 111 (Mar 2023), Edge 111 (Mar 2023), Firefox 151 (May 2026), and Safari 18 (Sep 2024).

Until container style queries are widely available, layer them on as a progressive enhancement: ship a selector-based default that works everywhere, and let the style query override it when supported. Use `:where()` on the context selector so the style query (same specificity, later in source order) wins automatically.

```css
/* Default styles — work everywhere */
.button {
  background: transparent;
  border: 1px solid currentColor;
}

.badge {
  display: none;
}

/* Selector-based contextual styles — broad browser support */
:where(.featured) .button {
  background: var(--brand-accent);
  color: white;
  border: none;
}

:where(.featured) .badge {
  display: block;
}

/* Progressive enhancement: style queries override when supported */
@container style(--surface: featured) {
  .button {
    background: var(--brand-accent);
    color: white;
    border: none;
  }

  .badge {
    display: block;
  }
}
```

The selector fallback ties the contextual styling to a class name, which couples the component to its DOM placement. Once style queries are widely supported, the `:where()` rule can be removed.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/css/usage-aware-component-variations.md#L65-L108). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
