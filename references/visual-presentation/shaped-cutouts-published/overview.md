Related section: [Adjacent Element SVG Masking](adjacent-element-svg-masking.md).
# Shaped Cutouts

## Overview
CSS Masking allows you to clip an element to a custom shape, such as adding a notch to a card or creating a shaped border. When combining shapes for complex layouts, choose your masking strategy based on the type of content the element contains:

| Masking strategy                | Best For                        | Text Impact                    |
| ------------------------------- | ------------------------------- | ------------------------------ |
| Direct Element SVG Masking      | Images, Icons, Decorative shapes, Complex shapes | Not recommended (can crop text) |
| Adjacent Element SVG Masking    | Cards with Text, Crucial content | Text remains fully readable    |
| Pure CSS Gradients              | Simple Geometric Shapes           | Not recommended (can crop text) |

---

## Implementation
To implement shaped cutouts:

### Using an SVG Mask
SVG masks allow you to define shapes that subtract from or add to the visible area using white (reveal) and black (hide) fills.

> **Luminance vs. Alpha Masking**: SVG masks default to **luminance** (brightness) mode, which is why we use `fill="white"` to reveal areas and `fill="black"` to cut them out. If you prefer to use the SVG's transparency (alpha channel) instead of colors, you can set `mask-type: alpha;` in CSS or `mask-type="alpha"` on the SVG `<mask>` element.

#### Direct Element SVG Masking
When there is no text inside the element to worry about (such as profile avatars, product images, or illustrations), you can apply the SVG mask directly to the element.

Using `maskContentUnits="objectBoundingBox"` inside the SVG mask ensures that the mask scales automatically to the width and height of any element it is applied to.

```html
<!-- 1. Define the mask in SVG (hidden from view) -->
<svg width="0" height="0" style="position: absolute;" aria-hidden="true">
  <defs>
    <!-- objectBoundingBox makes the mask scale from 0 to 1 along the element's borders -->
    <mask id="splat-mask" maskContentUnits="objectBoundingBox">
      <!-- Organic Bezier path defining an artistic paint splat shape -->
      <path d="M 0.5 0.05 C 0.58 0.05, 0.58 0.21, 0.67 0.18 C 0.76 0.15, 0.79 0.08, 0.85 0.15 C 0.91 0.22, 0.83 0.32, 0.89 0.38 C 0.95 0.44, 1.03 0.45, 0.99 0.55 C 0.95 0.65, 0.82 0.62, 0.8 0.72 C 0.78 0.82, 0.89 0.92, 0.8 0.97 C 0.71 1.02, 0.64 0.88, 0.55 0.93 C 0.46 0.98, 0.44 1.06, 0.35 1.01 C 0.26 0.96, 0.31 0.81, 0.22 0.79 C 0.13 0.77, 0.01 0.88, 0.01 0.77 C 0.01 0.66, 0.16 0.62, 0.14 0.52 C 0.12 0.42, -0.02 0.39, 0.03 0.29 C 0.08 0.19, 0.23 0.27, 0.29 0.19 C 0.35 0.11, 0.3 0.01, 0.4 0.01 C 0.5 0.01, 0.42 0.05, 0.5 0.05 Z" fill="white" />
    </mask>
  </defs>
</svg>

<!-- 2. Apply the mask to the image element -->
<img src="avatar.jpg" alt="User Profile" class="shaped-avatar">

<style>
.shaped-avatar {
  width: 200px;
  height: 200px;
  object-fit: cover;
  
  /* Apply the SVG mask ID with standard and webkit-prefixed properties */
  -webkit-mask-image: url(#splat-mask);
  mask-image: url(#splat-mask);
}
</style>
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/visual-design/shaped-cutouts.md#L1-L54). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
