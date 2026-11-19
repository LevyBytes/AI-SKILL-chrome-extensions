Related section: [Fallback strategies](fallback-strategies.md).
```yaml
---
name: child-state-based-styling
description: Build a component that changes its styling based on the state of one of its child elements. For example, a component that renders in light or dark mode based on whether a theme toggle is checked (or not).
web-feature-ids:
  - has
  - not
---
```

# Child State Based Styling

Historically, CSS selectors could only traverse downwards—you could style a child based on its parent, but not a parent based on its child. The `:has()` pseudo-class changes this, allowing you to conditionally style a container element depending on the presence or state of its descendants.

By combining `:has()` with state pseudo-classes (like `:checked`, `:focus`, `:valid`, `:invalid`, or `:not()`), you can build complex, interactive UI components entirely in CSS, without needing JavaScript to toggle "modifier" classes (like `.is-active` or `.has-error`) on parent elements.

This is particularly useful for components that need to respond to internal interactions, such as a localized theme toggle reacting to a checkbox (`:checked`), a form group highlighting an error (`:invalid`), or a card elevating when a child link is focused (`:focus-within`).

## Implementing state-based container styling

**MANDATORY**: You must use the `:has()` selector on the container element to detect the specific state (e.g., `:checked`, `:focus`, `:invalid`) of its interactive child element.

To build a component that changes its styling based on a child's state:

1. **Define the default styling**: Set CSS variables on the container to define its base state.
2. **Apply state-based overrides**: Target the container with `:has([child-selector]:[state])` and redefine the CSS variables for the active or alternate state.

*Example: A component that changes theme based on a child toggle.*

```css
/* 1. Define the default state on the component container */
.theme-card {
  /* Using custom properties makes state-switching cleaner */
  --card-bg: #ffffff;
  --card-text: #333333;
  --card-border: #cccccc;

  background-color: var(--card-bg);
  color: var(--card-text);
  border: 1px solid var(--card-border);

  /* Use a transition for smooth state changes */
  transition: background-color 0.3s, color 0.3s;
}

/* 2. Apply styles when the child enters the specific state */
/* MANDATORY: Target the container and use :has() to check the descendant's state */
.theme-card:has(.theme-toggle:checked) {
  /* Override the properties for the active or alternate state */
  --card-bg: #222222;
  --card-text: #f0f0f0;
  --card-border: #555555;
}
/* You can also combine :has() and :not() to target specific negative states */
/* This selects a card that DOES NOT have a toggle in the checked state */
.theme-card:not(:has(.theme-toggle:checked)) {
  /* Optional: Explicit styles for the unchecked state if needed */
}
```

```html
<!-- The container element that receives the styling -->
<div class="theme-card">
  <!-- The child element whose state controls the parent -->
  <label>
    <input type="checkbox" class="theme-toggle">
    Enable Dark Mode
  </label>

  <h2>Card Title</h2>
  <p>The style of this entire card is controlled by the checkbox above.</p>
</div>
```

**Performance tip**: When using `:has()`, scope the selector to the most specific container possible (like `.theme-card`). Avoid anchoring it to very high-level elements like `body:has(...)` if the styling changes are localized, as broad `:has()` queries can trigger more layout recalculations.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/css/child-state-based-styling/guide.md#L1-L74). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
