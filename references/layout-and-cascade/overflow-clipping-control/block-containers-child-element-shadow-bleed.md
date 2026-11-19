### Block Containers: Child Element Shadow Bleed

* Apply `overflow: clip` and define an extended `overflow-clip-margin` length offset to create a visible safety zone permitting the child's shadow to render unclipped outside the parent container without altering layout geometry. Without this, the child's shadow is clipped at the parent's boundary.

```html
<div class="safety-zone-parent">
  <h4>Clipped Container</h4>
  <p>Inner content boundaries safely contained.</p>
  <!-- Child button element positioned inside with a prominent shadow -->
  <button class="demo-glowing-btn">Submit</button>
</div>
```

```css
/**
 * Standard block layout container clipping inner content.
 * Base fallback uses overflow: hidden, which abruptly slices child element shadows.
 */
.safety-zone-parent {
  /* Level 1 Fallback: clips overflowing content but truncates child shadows */
  overflow: hidden;
}

/* Child button element positioned inside with an expanded shadow */
.demo-glowing-btn {
  display: block;
  box-shadow: 0 8px 13px rgba(229, 46, 113, 0.7);
}

@supports (overflow-clip-margin: 15px) {
  .safety-zone-parent {
    overflow: clip;
    /* Establishes a visible safety zone allowing child element shadows to render safely outside */
    overflow-clip-margin: 15px;
  }
}
```

## Strategic Implementation & Best Practices

- **DO** apply `overflow: clip` on target elements when utilizing `overflow-clip-margin`, as setting `overflow` strictly to `clip` is **mandatory** on standard block layout containers to activate custom or inner curved clip margins.
- **DO** set `overflow-clip-margin: content-box` on padded containers with rounded corners to automatically clip unrounded internal child elements into mathematically perfect nested border curves without manual padding subtraction logic.
- **DO** configure `overflow-clip-margin` with a specified length offset when applying external visual effects (like `filter: drop-shadow()`) to prevent sharp bounding box truncation without altering or expanding layout geometry.
- **DO NOT** apply `overflow: clip` if the container requires programmatic scroll manipulation via JavaScript or serves as the immediate layout context for `position: sticky` elements, as `clip` completely disables scrolling.

## Fallback Strategies

{{ BASELINE_STATUS("overflow-clip") }}
{{ BASELINE_STATUS("overflow-clip-margin") }}

For target environments lacking native support for `overflow: clip` or `overflow-clip-margin`, progressive enhancement fallback strategies depend directly on the visual intent:
- Fallback to `overflow: hidden` as the base experience to guarantee core boundaries are maintained.
- Fallback to `overflow: visible` on elements where drop-shadows or external corner badges must not be truncated.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/css/overflow-clipping-control/guide.md#L69-L122). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
