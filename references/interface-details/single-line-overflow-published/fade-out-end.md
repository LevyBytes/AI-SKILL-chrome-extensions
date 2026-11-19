### 2. Fade out the end

Use a mask that fades the end of the text. Only fade when the text overflows, or text that fits fades for no reason. An element with `overflow: hidden` is a scroll container, so its scroll timeline is only active when its content overflows. An animation on that timeline applies exactly when the text is truncated:

```css
/* --truncated is the flag the animation sets, registered so it does not inherit into nested elements.
   --fade-size is the configured size, registered so it can transition. */
@property --truncated {
  syntax: "<integer>";
  inherits: false;
  initial-value: 0;
}

@property --fade-size {
  syntax: "<length>";
  inherits: false;
  initial-value: 0px;
}

.label {
  white-space: nowrap;
  overflow: hidden;
  /* Example value: how much of the text fades */
  --fade-size: 2rem;
  /* Gradient directions and positions are physical, so flip them for right-to-left text */
  --fade-dir: right;
  --fade-pos: 100%;
  /* An opaque layer that is not clipped to the box, minus a band at the end.
     Masking only the band keeps everything else visible, including a focus outline outside the box.
     The band is --fade-size while truncated, 0 otherwise. */
  mask:
    linear-gradient(black, black) no-clip subtract,
    linear-gradient(to var(--fade-dir), transparent, black) var(--fade-pos) 0 / calc(var(--truncated) * var(--fade-size)) 100% no-repeat no-clip;
  /* Sets the flag only while the text overflows: with no overflow the timeline is inactive and the animation has no effect */
  animation: truncated linear both;
  animation-timeline: scroll(self inline);

  &:dir(rtl) {
    --fade-dir: left;
    --fade-pos: 0;
  }
}

@keyframes truncated {
  from, to {
    --truncated: 1;
  }
}
```

Keep the keyframes to the flag and derive the band from it. The reveal below transitions `--fade-size`, and a keyframe that set the band or the mask directly would not follow that transition in every browser.

DO NOT use a single gradient as the mask. A mask is clipped to the border box by default, so it also hides the element's focus outline, which is outside the box.

### 3. Replace with a predefined shorter version

Put both versions in the markup and switch them with a container query on the cell or item. The short version is presentational: hide it from assistive technology and from selection, and hide the long version visually rather than with `display: none`, so the full text stays the accessible name and what copy and find-in-page see.

```html
<!-- The wrapper is the container: size containment has no effect on table cells themselves -->
<td><div class="day"><span class="long">Saturday</span><span class="short" aria-hidden="true">Sat</span></div></td>
```

```css
.day {
  container-type: inline-size;
}

.short {
  display: none;
  user-select: none;
}

/* Example threshold: relative units resolve against the container's own font */
@container (inline-size < 6em) {
  /* Visually hidden, but still in the accessibility tree */
  .long {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .short {
    display: inline;
  }
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-atoms/single-line-overflow.md#L54-L144). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
