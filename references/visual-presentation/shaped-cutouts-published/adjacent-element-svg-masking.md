Related section: [Shaped cutouts](overview.md).
#### Adjacent Element SVG Masking
Apply the mask to an adjacent element rather than the parent element containing text. This ensures that text doesn't get clipped and remains readable.

To solve this, structure your component into a two-part layout:
1. A **safe, unmasked text container** (`.card-body`) for all readable content.
2. An **empty decorative `div`** (`.card-accent`) placed next to it, which receives the custom SVG mask.

By assigning both parts the same background color, they visually merge into a single, custom-shaped component.

```html
<!-- 1. Define the SVG mask (hidden from view) -->
<svg width="0" height="0" style="position: absolute;" aria-hidden="true">
  <defs>
    <!-- Use objectBoundingBox to make the mask scale with the element -->
    <mask id="accent-stencil" maskContentUnits="objectBoundingBox">
      <!-- Fill the entire area with white (fully visible) -->
      <rect width="1" height="1" fill="white" />
      <!-- Draw a black shape to cut out a concave curve. Extending the path to x=1.1 guarantees it fully clears the right edge, preventing subpixel lines -->
      <path d="M 1.1,0 C 0.4,0.1 0.4,0.9 1.1,1 L 1.1,0 Z" fill="black" />
    </mask>
  </defs>
</svg>

<!-- 2. Create the unified card layout -->
<div class="unified-card">
  <!-- The text-bearing element remains unmasked and perfectly rectangular -->
  <div class="card-body">
    <h3>Premium Membership</h3>
    <p>Get exclusive weekly updates on modern web standards and premium UI designs.</p>
  </div>
  <!-- The empty accent element next to it is masked to form the custom shape -->
  <div class="card-accent"></div>
</div>

<style>
.unified-card {
  display: flex;
  width: 400px;
  /* Shadow on the parent silhouettes the combined card + masked accent shape */
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3));
}

.card-body {
  flex: 1;
  background-color: #1e293b; /* Elegant slate color */
  color: #f8fafc;
  padding: 24px;
  border-top-left-radius: 16px;
  border-bottom-left-radius: 16px;
}

.card-accent {
  width: 60px;
  background-color: #1e293b; /* Same background color so they merge visually without seams */
  border-top-right-radius: 16px;
  border-bottom-right-radius: 16px;

  /* Reference the SVG mask */
  -webkit-mask-image: url(#accent-stencil);
  mask-image: url(#accent-stencil);
}
</style>
```

### Using a Single CSS Gradient for Simple Cutouts
When you only need simple geometric cutouts (such as a semi-circular top notch, side indentations, or straight diagonal cuts), you do not need to write or reference an external SVG. Instead, you can define a CSS radial or linear gradient directly inside the `mask-image` property.

```html
<div class="gradient-masked-card">
  <h3>Notched Coupon Card</h3>
  <p>This card uses a pure CSS radial gradient to cut out a semi-circular notch along its top edge.</p>
</div>

<style>
.gradient-masked-card {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  padding: 40px 24px 24px 24px; /* Extra top padding ensures content clears the notch */
  border-radius: 16px;
  text-align: center;

  /* radial-gradient places a circle at 50% (horizontal center) and 0% (top edge), cutting out a 20px transparent notch */
  -webkit-mask-image: radial-gradient(circle at 50% 0%, transparent 20px, black 21px);
  mask-image: radial-gradient(circle at 50% 0%, transparent 20px, black 21px);
}
</style>
```

## Fallback strategies
Baseline status for Masks: Widely available. It's been Baseline since 2023-12-07.
Supported by: Chrome 120 (Dec 2023), Edge 120 (Dec 2023), Firefox 53 (Apr 2017), and Safari 15.4 (Mar 2022).

If a browser does not support `mask-image` or the prefixed version:
- **For Shaped Images**: The element will degrade gracefully, displaying as a normal rectangular element with its default fallback styles.
- **For Shaped Cards**: The adjacent decorative `.card-accent` element will remain a solid, unmasked rectangle. Since it shares the same background color as the text container, the entire card will simply render as a standard, clean rectangular container.
- **Progressive Enhancement**: By keeping text layers outside the mask entirely, your content is guaranteed to remain completely readable, structured, and accessible on older browsers.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/visual-design/shaped-cutouts.md#L55-L150). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
