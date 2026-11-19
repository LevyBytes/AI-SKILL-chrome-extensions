## 4. OPTIONAL: Seamlessly morphing to the next page

You can optionally use **Cross-Document View Transitions** to create a seamless "morph" animation between the hovercard and the destination page. See `consistent-cross-document-transitions` (via `npx -y modern-web-guidance@latest retrieve "consistent-cross-document-transitions"`) for guidance on implementation.

By assigning matching `view-transition-name` values to elements in the hovercard and their counterparts on the next page, the browser will animate them across the navigation. You can name multiple elements (e.g. titles, images, bylines) to create a complex, multi-element morphing effect. Assign the `view-transition-name` to elements on the open popover using `:popover-open`, to avoid creating duplicate `view-transition-name`s or requiring link-specific `view-transition-name`s.

```css
/* Opt-in to cross-document transitions on both pages */
@view-transition {
  navigation: auto;
}

/* Don't show transitions when loading this page */
::view-transition-group(*) {
  animation-duration: 0s;
}

/* Assign names ONLY when the popover is open to ensure only the correct elements are selected. */
[popover]:popover-open {
  view-transition-name: --hovercard;
  view-transition-class: morph;

  h2 {
    view-transition-name: --title;
    view-transition-class: morph;
  }

  img {
    view-transition-name: --image;
    view-transition-class: morph;
  }
}
```

**MANDATORY:** To ensure the transition is stable and doesn't flicker, the destination page should use `blocking="render"` and `<link rel="expect">` to wait for critical content to be parsed before rendering the first frame.

```html
<!-- On the destination page: -->
<head>
  <!-- Block rendering until the hero image and title are parsed,
       ensuring the view transition snapshot is taken at the right time. -->
  <link rel="expect" href="#main-content" blocking="render">
</head>
<body>
  <main id="main-content">
    <h1>The buzz on hummingbirds</h1>
    <img src="bird.jpg">
  </main>
</body>
```

```css
/* On the destination page: */
main {
  view-transition-name: --hovercard;
  view-transition-class: morph;
}
h1 {
  view-transition-name: --title;
  view-transition-class: morph;
}
img {
  view-transition-name: --image;
  view-transition-class: morph;
}

/* By default no transition */
::view-transition-group(*) {
  animation-duration: 0s;
}
/* Short transition for morphing elements */
::view-transition-group(.morph) {
  animation-duration: 0.4s;
}
/* Disable transition if no `old` view */
::view-transition-new(.morph):only-child {
  animation-duration: 0s;
}
```

## Fallback strategies

Because the trigger is a standard `<a href="...">` link, browsers without support can still navigate on click if you choose to treat the hovercard as a progressive enhancement. When cross-browser hovercard support is required, conditionally load polyfills as needed.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/hovercard.md#L130-L213). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
