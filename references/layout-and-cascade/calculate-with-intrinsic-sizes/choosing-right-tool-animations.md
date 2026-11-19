#### Choosing the Right Tool for Animations
- **MANDATORY: Use `interpolate-size: allow-keywords`**: For simple animations to or from intrinsic sizes (e.g., `height: 0` to `height: auto`) without any mathematical modifications. This is the required approach for simple keyword interpolation and should ideally be applied globally via `:root`.

  ```css
  :root {
    /* Best practice: Enable keyword interpolation globally */
    interpolate-size: allow-keywords;
  }

  .item {
    height: 0;
    visibility: hidden;
    transition: height 0.3s ease, visibility 0.3s;
  }

  .item.open {
    /* Simple interpolation from 0 to auto now works without calc-size() */
    height: auto;
    visibility: visible;
  }
  ```

- **Use `calc-size()`**: ONLY when you need to perform mathematical calculations on an intrinsic size during a transition (e.g., adding padding or clamping the size).

```css
.accordion-content {
  display: block;
  overflow: hidden;
  /* MANDATORY: Fallback value for closed state */
  block-size: 0;
  /* Removes the closed content from the accessibility tree and the tab order;
     transitioning visibility keeps it visible until the panel finishes closing */
  visibility: hidden;
  transition: block-size 0.3s ease-out, visibility 0.3s;
}

.accordion-content.open {
  /* MANDATORY: Fallback value for open state */
  block-size: auto;

  /* 
    DO: Use calc-size(auto, ...) to enable animation from 0 to the element's 
    intrinsic size while doing a calculation (in this case, adding a space of 2rem).
  */
  block-size: calc-size(auto, size + 2rem);
  visibility: visible;
}
```

**MANDATORY**: Collapsing to zero size (`block-size: 0` or `height: 0`) hides content only visually: screen readers still read it, and its links and controls stay in the tab order. Set `visibility: hidden` on the closed state and `visibility: visible` on the open state, and include `visibility` in the transition so the content stays visible until it has finished closing.

**MANDATORY**: Interpolation between two intrinsic sizing keywords is not possible directly. One end of the transition must be a length or a percentage.

#### Respecting User Motion Preferences
Animations that change the size of large layout areas can be particularly disruptive for users with vestibular disorders. **MANDATORY**: Always respect user motion preferences by using the `prefers-reduced-motion` media query to simplify or minimize non-essential animations. Common strategies include disabling motion entirely, reducing duration, or replacing layout shifts with subtle opacity transitions.

```css
.accordion-content {
  opacity: 0;
  visibility: hidden;
  transition: block-size 0.3s ease, opacity 0.3s ease, visibility 0.3s;
}

.accordion-content.open {
  opacity: 1;
  visibility: visible;
}

@media (prefers-reduced-motion: reduce) {
  .accordion-content {
    /* 
       EXAMPLE: Replacing disruptive layout animations with a subtle fade-in.
       Setting the block-size instantly and transitioning opacity 
       provides a clear state change without large-scale motion.
    */
    transition: opacity 1.5s ease;
  }

  .accordion-content.open {
    /* Jump the size instantly */
    block-size: auto;
  }
}
```



GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/css/calculate-with-intrinsic-sizes/guide.md#L64-L149). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
