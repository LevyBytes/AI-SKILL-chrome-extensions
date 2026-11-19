Related section: [Notes on Dimension Changes](notes-on-dimension-changes.md).
```yaml
---
name: state-aware-sticky-headers
description: Build sticky section headers or navbars that visually transform when they're actually "stuck" at the top, changing their color scheme or gaining a shadow.
web-feature-ids:
  - container-scroll-state-queries
sources:
  - https://webstatus.dev/features/container-scroll-state-queries
---
```

# State-Aware Sticky Headers

Sticky headers are a common UI pattern, but they often need to change their appearance when they become "stuck" to maintain readability or save space. Traditional solutions required JavaScript scroll listeners, which can cause performance issues. Modern CSS allows you to handle this natively using **Scroll State Queries**.

## Implementation Steps

### 1. Create the Sticky Container
You need a container that will act as the sticky element and the container for the scroll state query.

```html
<!-- Wrap in a section to define the containment area for the sticky element -->
<div class="section">
  <div class="sticky-container">
    <div class="sticky-header">
      Section Header
    </div>
  </div>
  <div class="content">
    <!-- Content goes here -->
  </div>
</div>
```

### 2. Apply CSS for Sticky Behavior and Container Type
Set `container-type: scroll-state` on the `position: sticky` element, not on its scrollable ancestor. Always specify a `container-name`, since these queries may be nested and unnamed containers will collide. You can also combine it with size queries, e.g., `container-type: scroll-state inline-size`.

```css
.sticky-container {
  position: sticky;
  top: 0;
  /* MANDATORY: Always specify a container name to avoid collisions if CQs are nested */
  container-type: scroll-state;
  container-name: section-header;
  z-index: 10;
}

.sticky-header {
  /* Base styles for the header */
  background: #f0f0f0;
  padding: 20px;
  transition: background-color 0.3s, box-shadow 0.3s;
}
```

**Important:** The scroll state is queried by **descendants** of the scroll-state container. The styles in the `@container` query will not apply to the `.sticky-container` itself, but to its children (like `.sticky-header`). You cannot style the container element itself with its own scroll-state query.

Add `scroll-padding-top` to the scrollport and set the value to be equal or greater than the sticky element's height. This approach should ensure that when controls receive focus, they'll be consistently visible below the sticky content, adhering to WCAG 2.4.11 Focus Not Obscured (Minimum), which requires that focused components are not fully obscured.

```css
html {
  /* Accounts for the height of the header */
  scroll-padding-top: var(--header-height); 
}
```


### 3. Target the Stuck State
Use the `@container scroll-state(...)` query to apply styles when the header is stuck.

```css
/* Apply styles when the named container is stuck at the top */
@container section-header scroll-state(stuck: top) {
  .sticky-header {
    background: #0056b3;
    color: white;
    box-shadow: 0 4px 6px rgb(0 0 0 / 0.15);
  }
}
```

**Tip:** You can also use logical properties like `stuck: block-start` or `stuck: inline-start` to better support internationalization (i18n) and right-to-left (RTL) layouts by querying flow-relative edges rather than physical ones.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-atoms/state-aware-sticky-headers/guide.md#L1-L81). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
