Related section: [Using style queries as a progressive enhancement](using-style-queries-as-progressive-enhancement.md).
# Design Token Reactivity

## Background & Overview

Often an author will need to make contextual changes to the design of a component. Historically authors would need to use selectors to apply such changes. This often meant that while many of their design tokens could exist as custom properties, higher-order design tokens could only be encoded as a selector pattern (i.e. using a class name or attribute convention) or as props/context in a JavaScript framework.

**Container style queries** allow authors to style elements based on the computed custom property value of an ancestor element. This means authors can write meaningful design token values within their stylesheets rather than relying on markup or JavaScript for presentation.

## How to implement

Implementing a reactive design token using a container style query is quite straightforward:

1. Set the higher-order design token as a custom property on a container. This does not need to be a registered custom property.
2. Use the `@container style()` rule to query the value of that custom property.
3. Apply the appropriate styles to a descendant element within the container.

A few things to keep in mind:

- The container being queried with a style query does not need to have a `container-type` or `container-name` set, however, a `container-name` can allow for more specific querying.
- The container itself cannot be styled by the container style query.

The following is a basic example of the above implementation steps.

```html
<div class="features">
  <div class="card"></div>
  <div class="card"></div>
</div>
<div class="bugs">
  <div class="card"></div>
  <div class="card"></div>
  <div class="card"></div>
  <div class="card"></div>
</div>
```

```css
.features {
  --density: spacious;
}

.bugs {
  --density: compact;
}

@container style(--density: compact) {
  .card {
    padding: 8px;
  }
}

@container style(--density: spacious) {
  .card {
    padding: 24px;
  }
}
```

## Fallback strategies

Baseline status for Container style queries: Newly available. It's been Baseline since 2026-05-19.
Supported by: Chrome 111 (Mar 2023), Edge 111 (Mar 2023), Firefox 151 (May 2026), and Safari 18 (Sep 2024).

Until there is Baseline support for container style queries it is NOT RECOMMENDED that they be used for core features that must be available across all browsers, since it is not simple to create a fallback for them that does not take away from their benefits or that have their own limitations. For example, if a UI density user preference is not deemed to be a core feature that must be available across all experiences, then container style queries can be use to implement the feature without a fallback.

### Using selectors instead

For core features, an alternate approach using selectors should be used. This example uses a `data-density` attribute to encode the density design token in the markup rather than as a custom property:

```html
<div class="features" data-density="spacious">
  <div class="card"></div>
  <div class="card"></div>
</div>
<div class="bugs" data-density="compact">
  <div class="card"></div>
  <div class="card"></div>
  <div class="card"></div>
  <div class="card"></div>
</div>
```

```css
/* This example uses `:where()` to avoid increasing specificity */
:where([data-density="compact"]) .card {
  padding: var(--card-padding-compact);
}

:where([data-density="spacious"]) .card {
  padding: var(--card-padding-spacious);
}
```

A major limitation of this fallback approach is that it does not support nesting elements with the `data-density` attribute set, since the selector specificity is the same, order of appearance will be used to determine the styles (i.e. `[data-density="spacious"]` will always take precedence over `[data-density="compact"]`).


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/css/design-token-reactivity.md#L1-L95). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
