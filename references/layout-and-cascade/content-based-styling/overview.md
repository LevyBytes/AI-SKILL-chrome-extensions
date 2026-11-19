Related section: [Fallback strategies](fallback-strategies.md).
```yaml
---
name: content-based-styling
description: Build a component that changes its layout based on whether it contains specific child elements (or not). For example, if the component contains an image, use a multi-column layout, otherwise default to a single-column layout.
web-feature-ids:
  - has
  - not
---
```

# Content Based Styling

Historically, applying different layouts to a component based on its content required either JavaScript or conditional logic in your HTML templating language to inject modifier classes (like `.card--has-image` or `.card--text-only`).

The `:has()` pseudo-class eliminates this need by acting as a parent selector. It allows you to conditionally style a container element based on the presence or absence of specific descendant elements.

Using `:has()`, you can easily define distinct layout variations entirely in CSS based on a component's actual DOM content. You can also optionally combine it with `:not()` to explicitly target the *absence* of content to define default layouts.

### Implementing content-based container styling

**MANDATORY**: You must use the `:has()` selector on the container element to detect the presence of specific child content.

To build a component that changes its layout based on its content:

1. **Define the default styling**: Apply the base layout styles to the container element (e.g., a simple single-column stack).
2. **Apply content-based overrides**: Target the container with `:has([child-selector])` and apply the new layout styles for when that content is present (e.g., a multi-column grid).

*Example: A card component that switches to a side-by-side layout if an image is present.*

```css
/* 1. Define the default state on the component container */
/* This applies when there is NO image */
.article-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}

/* 2. Apply styles when a specific child element is present */
/* MANDATORY: Target the container and use :has() to check for the descendant */
.article-card:has(img) {
  /* Change the layout to a row if an image exists */
  flex-direction: row;
  align-items: center;
}

/* Optional: Style the image itself (no :has() needed here) */
.article-card img {
  width: 150px;
  height: auto;
  border-radius: 4px;
}

/* You can also combine :has() and :not() to explicitly target the ABSENCE of content */
/* This selects a card that DOES NOT have an image */
.article-card:not(:has(img)) {
  /* E.g., apply a different background color for text-only cards */
  background-color: #f9f9f9;
}
```

```html
<!-- Assume an <h1> precedes these components in the document layout -->
<!-- A card WITH an image (will use row layout) -->
<article class="article-card">
  <img src="thumbnail.jpg" alt="Article thumbnail" />
  <div class="content">
    <h2>Card With Image</h2>
    <p>This card lays out its content horizontally.</p>
  </div>
</article>

<!-- A card WITHOUT an image (will use default column layout) -->
<article class="article-card">
  <div class="content">
    <h2>Text-Only Card</h2>
    <p>This card lays out its content vertically, and gets its background color from the :not(:has()) rule.</p>
  </div>
</article>
```

**Performance tip**: When using `:has()`, scope the selector to the most specific component container possible (like `.article-card`). Avoid anchoring it to very high-level elements like `body:has(img)` if the styling changes are highly localized, as broad `:has()` queries can trigger more layout recalculations.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/css/content-based-styling/guide.md#L1-L84). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
