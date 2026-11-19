Related section: [Scrollspy](overview.md).
## Best Practices

- **DO** use `scroll-target-group: auto` on a dedicated container for navigation links: This ensures the browser knows which links should be tracked.
- **DO** ensure targets have unique `id` attributes matching the links' `href` attributes.
- **DO** provide enough vertical space for sections: `scroll-target-group` most clearly identifies the visible target when sections are large enough that only one or two are visible at a time.
- **MANDATORY**: For accessibility, the visual state must be mirrored with `aria-current`. While `:target-current` handles the visual aspect, this is not exposed to screen readers.
- **AVOID** relying solely on color for the active state: Include other visual cues like font weight, an underline, or an indicator dot, or ensure there is sufficient contrast between the colors to ensure the difference is accessible to users with color vision deficiencies.

## Fallback strategies

Browser support for scroll-target-group: Limited availability.
Supported by: Chrome 140 (Sep 2025) and Edge 140 (Sep 2025).
Unsupported in: Firefox and Safari.

For browsers that do not support `scroll-target-group`, you should use a fallback based on the `IntersectionObserver` API.

```html
<script>
  // Feature detection for scroll-target-group
  const supportsScrollTargetGroup = CSS.supports('scroll-target-group: auto');

  if (!supportsScrollTargetGroup) {
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('main section');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            const isActive = link.getAttribute('href') === `#${id}`;
            // Use the escaped colon class for consistent styling
            link.classList.toggle('target-current', isActive);
            link.setAttribute('aria-current', isActive);
          });
        }
      });
    }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });

    sections.forEach(section => observer.observe(section));
  }
</script>

<style>
  /* Fallback style if :target-current is not supported.
     Use :is() to combine the native pseudo-class with a fallback class for older browsers. DO NOT use `nav a:target-current, nav a.target-current, as the unrecognized pseudoselector invalidates the entire rule in older browsers. */
  nav a:is(:target-current, .target-current) {
    color: var(--accent, #007bff);
    border-bottom-color: var(--accent, #007bff);
    font-weight: bold;
  }
</style>
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/scrollspy.md#L90-L142). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
