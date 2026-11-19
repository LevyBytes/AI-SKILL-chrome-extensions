Related section: [Scrollspy](overview.md).
## Accessibility considerations

To ensure that people can navigate the scrollable region after selecting an anchor element, apply the corresponding element with a `tabindex="-1"` attribute. This will allow the element to receive focus, and allow people using a keyboard to scroll the container, or easily navigate from that content.

```html
<li><a href="#section-2">Section 2</a></li>
…
<!-- Adding a tabindex="-1" attribute to the section target will mean that it can receive focus after being navigated to -->
<section id="section-2" tabindex="-1">
  <h2>Section 2</h2>
</section>
```

To ensure consistent operability across different browsers and assistive technology combinations, if the scrollable container is not the `<body>` element, ensure that it can receive focus (by applying `tabindex="0"`), and has an accessible name that describes the content, along with an appropriate role (such as `role="region"`), if it does not already have an implicit role (which elements like `<main>` do).

## Best Practices

- **DO** use `scroll-target-group: auto` on a dedicated container for navigation links: This ensures the browser knows which links should be tracked.
- **DO** ensure targets have unique `id` attributes matching the links' `href` attributes.
- **DO** provide enough vertical space for sections: `scroll-target-group` most clearly identifies the visible target when sections are large enough that only one or two are visible at a time.
- **MANDATORY**: For accessibility, the visual state must be mirrored with `aria-current`. While `:target-current` handles the visual aspect, this is not exposed to screen readers.
- **AVOID** relying solely on color for the active state: Include other visual cues like font weight, an underline, or an indicator dot, or ensure there is sufficient contrast between the colors to ensure the difference is accessible to users with color vision deficiencies.

## Fallback strategies

{{ BASELINE_STATUS("scroll-target-group") }}

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

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/scrollspy/guide.md#L85-L150). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
