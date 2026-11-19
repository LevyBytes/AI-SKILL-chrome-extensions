```yaml
---
name: consistent-cross-document-transitions
description: Ensure critical page state is loaded and stable before initiating a cross-document view transition. This means critical CSS styles are loaded and applied, critical JavaScript is loaded and run, and the HTML visible for the user's initial view of the page has been parsed before the transition runs.
web-feature-ids:
  - blocking-render
  - link-rel-expect
  - cross-document-view-transitions
---
```

# Consistent Cross-Document Transitions

## The Problem

Cross-document view transitions animate elements between two pages during a same-origin navigation. The browser captures a snapshot of the old page, navigates, then animates from the snapshot to the new page. If the new page has not finished loading critical resources — stylesheets, layout scripts, or key DOM elements — the transition animates to an incomplete or unstyled state. This causes visual glitches such as elements morphing to wrong positions, content reflowing mid-animation, or fallback fonts flashing to web fonts after the transition completes.

## The Solution

Use `blocking="render"` on critical `<link>` and `<script>` elements in the new page's `<head>`, and use `<link rel="expect">` to block rendering until specific DOM elements have been parsed. This ensures the browser does not begin the view transition animation until the new page's visual state is stable. The browser continues parsing the HTML in the background — only painting is deferred.

### Implementation Strategy

1. **MANDATORY:** Opt in to cross-document view transitions with the `@view-transition` CSS at-rule on both pages.
2. **MANDATORY:** Ensure critical stylesheets are in the `<head>`. Stylesheets in the `<head>` are render-blocking by default. Dynamically injected stylesheets require explicit `blocking="render"`.
3. **DO** use `blocking="render"` on `<script>` elements that must execute before the transition animates (e.g., scripts that apply a theme or affect the layout).
4. **DO** use `<link rel="expect" href="#element-id" blocking="render">` to block rendering until above-the-fold content has been parsed. This applies to all transition types: full-page cross-fades (to avoid animating to a blank page), morph animations (to ensure named elements exist in the DOM), and script-dependent layouts (to ensure styled content is parsed).
5. **DO NOT** block rendering on non-critical content. Only block on resources and elements that affect the initial viewport. Blocking on too much content delays the transition and degrades perceived performance.

## Implementation Guide

### Step 1: Opt in to Cross-Document View Transitions

MANDATORY: Both the source and destination pages must include the `@view-transition` at-rule. Without this, no cross-document transition occurs.

```css
/*
  MANDATORY: Include this rule in every page that participates
  in cross-document view transitions.
  `navigation: auto` enables transitions for standard navigations
  (link clicks, form submissions, back/forward).
*/
@view-transition {
  navigation: auto;
}

/* MANDATORY Copy-Paste Safety: Disable cross-document view transitions for users requesting reduced motion */
@media (prefers-reduced-motion: reduce) {
  @view-transition {
    navigation: none;
  }
}
```

### Step 2: Block Rendering Until Critical Scripts Execute

If a non-blocking script in the `<head>` must run before the transition animates (e.g., to apply a theme class or affect the layout), mark it with `blocking="render"`. Without this, `async`, `defer`, or `type="module"` scripts may execute after the transition has already started.

```html
<head>
  <!--
    DO: Mark layout-critical scripts with blocking="render".
  -->
  <script type=module blocking="render">
    // Example: apply a stored theme before the page renders,
    // so the transition snapshot reflects the correct theme.
    document.documentElement.dataset.theme =
      localStorage.getItem('theme') || 'light';
  </script>
</head>
```

### Step 3: Block Rendering Until Key DOM Elements Are Parsed

Stylesheets and `blocking="render"` scripts in the `<head>` only guarantee that the `<head>` has been fully processed. They do **not** wait for any `<body>` content to be parsed. Without additional blocking, the browser may take the new-page snapshot before above-the-fold elements exist in the DOM — resulting in a transition that animates to a blank or partially rendered page.

`<link rel="expect">` solves this by blocking rendering until a specific element (identified by its `id`) has been parsed. The `href` value must be a fragment identifier (e.g., `#hero`) matching the target element's `id` attribute. Once that element's closing tag is parsed, the render block is released. Note that `<link rel="expect">` only guarantees that the target DOM element exists in the document — it does **not** wait for external subresources (such as `<img>` pixels) to download or decode.

**DO** use `<link rel="expect">` in all of the following scenarios:


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/consistent-cross-document-transitions/guide.md#L1-L78). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
