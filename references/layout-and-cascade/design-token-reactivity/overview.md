```yaml
---
name: design-token-reactivity
description: Define higher-order design tokens, like density modes (compact, comfortable, spacious) or themes and have descendant components react to changes directly and in component-appropriate ways.
web-feature-ids:
  - container-style-queries
---
```

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

{{ BASELINE_STATUS("container-style-queries") }}

Until there is Baseline support for container style queries it is NOT RECOMMENDED that they be used for core features that must be available across all browsers, since it is not simple to create a fallback for them that does not take away from their benefits or that have their own limitations. For example, if a UI density user preference is not deemed to be a core feature that must be available across all experiences, then container style queries can be use to implement the feature without a fallback.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/css/design-token-reactivity/guide.md#L1-L71). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
