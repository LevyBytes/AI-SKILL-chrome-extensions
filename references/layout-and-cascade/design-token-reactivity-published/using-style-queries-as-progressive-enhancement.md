Related section: [Design token reactivity](overview.md).
### Using style queries as a progressive enhancement

While it’s NOT RECOMMENDED, if you want to use style queries as a progressive enhancement for a core feature, then to avoid duplication you can create some custom properties, then include the style queries after. Make sure the fallback approach uses `:where()` when selecting the container elements to avoid increasing the specificity.

```css
.card {
  --card-padding-compact: 8px;
  --card-padding-spacious: 24px;
}

:where([data-density="compact"]) .card {
  padding: var(--card-padding-compact);
}

:where([data-density="spacious"]) .card {
  padding: var(--card-padding-spacious);
}

/* Use style queries as a progressive enhancement: same specificity, so order of appearance is used */

@container style(--density: compact) {
  .card {
    padding: var(--card-padding-compact);
  }
}

@container style(--density: spacious) {
  .card {
    padding: var(--card-padding-spacious);
  }
}
```

### Feature-checking with just CSS

If you need to feature check container style queries to conditionally display some UI that relies on it, you can use a style query to do so:

```css
:root {
  --style-queries-supported: check;
}

.density-toggle {
  display: none;
}

@container style(--style-queries-supported) {
  .density-toggle {
    display: revert;
  }
}
```

### Feature-checking with JavaScript

For feature-checking with JavaScript, it is slightly more complicated as the `CSSContainerRule` interface existed prior to the addition of container style queries, so it is unreliable for this purpose. Instead, you’ll need to check the computed value of a known property that is being set with a style query.

This example uses a custom property as it will have no visual effect:

```css
:root {
  --style-queries-supported: check;
}

@container style(--style-queries-supported: check) {
  body {
    --style-queries-supported: yes;
  }
}
```

Then check the computed value in JavaScript like this:

```js
if (getComputedStyle(document.body).getPropertyValue("--style-queries-supported") === "yes") {
  // Use container style queries
} else {
  // Use fallback strategy
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/css/design-token-reactivity.md#L96-L176). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
