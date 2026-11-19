Related section: [Content based styling](overview.md).
### Fallback strategies

{{ BASELINE_STATUS("has") }}

If the content-based layout styling is critical to the user experience or page design, you must provide a fallback for browsers that do not support the `:has()` selector. For purely decorative effects, `:has()` can be used as a progressive enhancement without a fallback.

**MANDATORY**: When implementing a fallback for critical layouts, you must use `@supports not selector(:has(*))` in your CSS to define a traditional class-based fallback (e.g., `.has-image`).

Unlike interactive state-based styling, content presence is typically known at render time. The most robust fallback is to have your server-side templating engine (or static site generator) inject a class like `.has-image` onto the container if the child element (like an image) exists in the data.

If server-side rendering is not an option, you must use a small script with `CSS.supports()` to detect the content and append the class on load or after dynamic content injection.

```css
/* Fallback CSS for older browsers */
/* We check if the browser DOES NOT support the :has() selector */
@supports not selector(:has(*)) {
  /* Define a traditional modifier class that applies the exact same layout overrides */
  .article-card.has-image {
    flex-direction: row;
    align-items: center;
  }
  
  .article-card:not(.has-image) {
    background-color: #f9f9f9;
  }
}
```

```javascript
/* Fallback JavaScript for older browsers (if not using SSR to add the class) */
/* Check for support before running the script to avoid unnecessary work in modern browsers */
if (!CSS.supports('selector(:has(*))')) {
  // Find all components that need checking
  const cards = document.querySelectorAll('.article-card');
  
  cards.forEach(card => {
    // If the critical content exists, manually add the fallback class
    if (card.querySelector('img')) {
      card.classList.add('has-image');
    }
  });
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/css/content-based-styling/guide.md#L85-L127). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
