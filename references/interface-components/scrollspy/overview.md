Related section: [Accessibility considerations](accessibility-considerations.md).
```yaml
---
name: scrollspy
description: Highlight the currently visible section of a page in a navigation menu
web-feature-ids:
  - scroll-marker-targets
  - scroll-target-group
guides:
  - scroll-progress-indicator
---
```

# Build a Scrollspy Navigation

A scrollspy navigation is a common UI pattern that automatically highlights the navigation link corresponding to the section of the page currently in the viewport. This provides users with a clear sense of where they are in a long document as they scroll.

This pattern is common in two scenarios:
- **Single-page websites**: Where the primary site navigation links to different sections of a single page rather than separate URLs.
- **Long-form content**: Where a table of contents or sidebar navigation tracks the user's progress through an article, guide, or documentation.

## How to implement

Traditionally, the scrollspy pattern required JavaScript and the `IntersectionObserver` API. Modern CSS provides a native way to achieve this using the `scroll-target-group` property and the `:target-current` pseudo-class.

1.  **Ensure Navigation Links use Fragment Identifiers**: Your navigation must consist of anchor links (`<a>`) that point to sections on the same page using fragment identifiers (e.g., `<a href="#section-1">`) that match the `id` of your content sections.
2.  **Enable Scroll Target Grouping**: Apply the `scroll-target-group: auto` property to the container of your navigation links. This tells the browser to treat these links as markers that track their respective targets.
3.  **Style the Active Link**: Use the `:target-current` pseudo-class on your navigation links to apply styles when their target section is visible in the scroll container.
4.  **Semantic State**: Use a script to update `aria-current="true"` on the active link when scrolling stops to ensure the state is correctly communicated to assistive technologies.

## Example code

This example highlights the active link in a fixed navigation menu as the user scrolls through sections.

```css

/* MANDATORY: The container of markers must have scroll-target-group: auto */
nav {
  /* Enables automatic tracking of fragment links */
  scroll-target-group: auto;
}
/* MANDATORY: Use :target-current to style the link whose target is in view. */
nav a:target-current {
  color: var(--accent, #007bff);
  border-bottom-color: var(--accent, #007bff);
}
```

```html
<nav>
  <a href="#intro">Introduction</a>
  <a href="#features">Features</a>
  <a href="#pricing">Pricing</a>
</nav>

<main>
  <!-- MANDATORY: Each section must have a unique ID matching a link fragment in the <nav> and tabindex="-1" so it can receive focus. -->
  <section id="intro" tabindex="-1">
    <h2>Introduction</h2>
    <!-- content -->
  </section>
  <section id="features" tabindex="-1">
    <h2>Features</h2>
    <!-- content -->
  </section>
  <section id="pricing" tabindex="-1">
    <h2>Pricing</h2>
    <!-- content -->
  </section>
</main>

<script type="module">
  if (CSS.supports('scroll-target-group: auto')) {
    const syncAriaCurrent = () => {
      const currentLink = document.querySelector('nav a:target-current');
      document.querySelectorAll('nav a').forEach(link => {
        link.setAttribute('aria-current', link === currentLink ? 'true' : 'false');
      });
    };
    // Update the aria on initial page load. Ensure the DOM content is loaded, either by using `<script type="module">` or an event listener for `DOMContentLoaded`.
    syncAriaCurrent();
    // Update the aria after scroll ends
    document.addEventListener('scrollend', syncAriaCurrent);
  }
</script>
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/scrollspy/guide.md#L1-L84). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
