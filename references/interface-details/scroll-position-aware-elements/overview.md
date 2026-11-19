Related section: [Basic Fallback](basic-fallback.md).
```yaml
---
name: scroll-position-aware-elements
description: Build floating buttons or widgets (back-to-top, scroll-to-bottom, chat launchers, etc.) that appear and disappear based on whether the user has scrolled at all.
web-feature-ids:
  - container-scroll-state-queries
---
```

# Scroll Position Aware Elements

## Overview

Improve the user experience of floating buttons, like a "Back to Top" link, by showing them only when they are useful. This guide shows how to build these elements using CSS `container-scroll-state-queries`, which allows styling elements based on the scroll position of their container without relying on JavaScript scroll listeners or observers.

## Implementation

### 1. Establish the Scroll Container

The scroll container must be declared as a scroll-state query container.

```css
.scroller {
  overflow-y: auto;
  /* Establish this element as a scroll-state query container */
  container-type: scroll-state;
}
```

### 2. Style the Floating Element

Place the element inside the container and style it. By default, it should be hidden.

```css
.back-to-top {
  position: sticky;
  bottom: 20px;
  visibility: hidden;
  opacity: 0;
  translate: 0 20px;
  transition:
    visibility 0.3s,
    opacity 0.3s ease,
    translate 0.3s ease;
}
```

> [!IMPORTANT]
> Sticky or floating elements hover above the scrollable content. Ensure that the main content has sufficient bottom padding or margin so that the last few elements are not permanently covered by the button when the user scrolls completely to the bottom.

### 3. Respond to the Scroll State

Use the `@container` rule with the `scroll-state` function. To check if the user has scrolled down, check if the container is scrollable to the top.

```css
/* When the container can be scrolled toward the top, it means the user has scrolled down */
@container scroll-state(scrollable: top) {
  .back-to-top {
    visibility: visible;
    opacity: 1;
    translate: 0 0;
  }
}
```

### 4. Manage Focus and Scroll Container Semantics

When hiding elements that are dependent on scroll position, account for loss of focus when the control disappears. For example, if someone is focused on a "Back to Top" control and uses `Page Up` or `Home` to scroll the container in the background without activating the control directly, the control becomes hidden (`visibility: hidden`) at the top of the scrollable region and focus would otherwise reset to the `<body>` element. Listen for `focusout` and move focus to the scrollable region when the hidden control loses focus without transferring focus to another element:


## Fallback strategies

{{ BASELINE_STATUS("container-scroll-state-queries") }}


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-atoms/scroll-position-aware-elements/guide.md#L1-L72). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
