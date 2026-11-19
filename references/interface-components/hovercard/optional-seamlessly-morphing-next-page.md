## 4. OPTIONAL: Seamlessly morphing to the next page

You can optionally use **Cross-Document View Transitions** to create a seamless "morph" animation between the hovercard and the destination page. See {{ GUIDE_REF("consistent-cross-document-transitions") }} for guidance on implementation.

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
    <img src="bird.jpg" alt="A hummingbird in flight">
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

{{ FEATURE_FALLBACKS("popover") }}

### Fallbacks & browser support for `popover="hint"`

{{ BASELINE_STATUS("popover-hint") }}

The `@oddbird/popover-polyfill` package does not polyfill `popover="hint"` in browsers that already support native `popover` (`auto` and `manual`). In those browsers, the unrecognized `"hint"` value defaults to `popover="manual"` (the HTML invalid value default), so a hovercard opened via keyboard focus may remain open if a second hovercard is opened via pointer hover unless explicitly dismissed on loss of interest by the invoker.

{{ FEATURE_FALLBACKS("interest-invokers") }}

{{ FEATURE("anchor-positioning", "popover-fallbacks") }}


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/hovercard/guide.md#L106-L201). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
