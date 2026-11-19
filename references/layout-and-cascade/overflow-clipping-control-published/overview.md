# Overflow Clipping Control

While `overflow: hidden` is a "blunt instrument" that almost always clips content strictly at the padding-box, `overflow: clip` combined with `overflow-clip-margin` provides the "scalpel" for fine-grained layout control across block containers.

Specify exactly where clipping occurs with `overflow: clip` and `overflow-clip-margin`. You can align the boundary precisely with inner box-model edges or extend the clipping boundary beyond the element's box by a specified offset (a safety margin). This modern approach is highly performant and eliminates the legacy requirement of adding extra wrapper containers with custom padding and negative margins just to let visual effects (like prominent child element shadows) render unclipped.

Replaced elements (`<img>`, `<video>`, `<canvas>`, etc.) default to `overflow: clip` and `overflow-clip-margin: content-box`, giving you control to cleanly contain images that use `object-fit` or `border-radius`. 

## How to Implement

1. **Apply `overflow: clip`**: Ensure the target element has `overflow: clip` enabled. Setting `overflow: clip` is **mandatory** on block layout containers for `overflow-clip-margin` to take effect. If `overflow` is set to `hidden`, `auto`, or `scroll`, the `overflow-clip-margin` property is ignored by the browser. `overflow: clip` prevents all scrolling (both user-initiated and programmatic via JavaScript).
2. **Align to a Box-Edge**: Use keywords to precisely align the clipping boundary to inner box-model edges:
   - `content-box`: Clips content exactly where the content area begins, leaving the padding area completely clean. Content stops right at the padding's edge. Excellent for nested layout modules.
   - `padding-box` (Default): Clips content at the inner edge of the border.
   - `border-box`: Clips content at the outer edge of the border, allowing content to sit under or partially overlap a translucent border.
3. **Define a Specified Offset (The Bleed)**: Provide a length value (e.g., `15px` or `5px`) to create a safety zone before cutting pixels. This allows prominent child element shadows to render unclipped past the boundary edge without expanding layout geometry.
4. **Combine Box-Edge and Offset**: Specify both a box edge and a length offset simultaneously (e.g., `content-box 15px`) to offset from a specific box edge.

## Example Code

The following examples demonstrate dynamic container layout controls, showcasing automated inner content curve nested framing and child element shadow protection alongside progressive enhancement fallbacks.

### Block Containers: Nested Rounded Curves

* Apply `overflow-clip-margin: content-box` to a parent container with rounded corners and custom padding.
* Apply similar rounded corners on inner child media and footer components along the concentric inner content box boundary, solving awkward nesting curves without custom `calc()` logic.

```html
<div class="nested-curve-parent">
  <img src="avatar.jpg" alt="Nested Curve Demo">
  <div class="nested-curve-footer">Card Footer</div>
</div>
```

```css
/**
 * Standard block layout container with outer corner radii and padding.
 * Keeps base level 1 fallback clipping roughly at the inner padding box.
 */
.nested-curve-parent {
  /* Level 1 Fallback: clips child roughly at the padding box */
  overflow: hidden;
}

/* Inner footer component with 12px rounded to visually demonstrate automatic concentric corner clipping */
.nested-curve-footer {
  background: #111;
  color: #fff;
}

@supports (overflow-clip-margin: content-box) {
  .nested-curve-parent {
    /* MANDATORY: overflow: clip is required on non-replaced elements */
    overflow: clip;
    /* Automatically curves clipping edge to match inner content-box radius */
    overflow-clip-margin: content-box;
  }
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/css/overflow-clipping-control.md#L1-L60). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
