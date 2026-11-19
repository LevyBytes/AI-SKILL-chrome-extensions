Related section: [Equal width text lines](overview.md).
### For `text-fit`

{{ BASELINE_STATUS("text-fit") }}

Forced lines have a short, faithful fallback: measure each line at its base size and scale it by the ratio to the container, with the same cap.

```css
@supports not (text-fit: grow) {
  .lockup > span {
    /* Shrink-wrap each line so its width is the text width */
    width: fit-content;
    /* --text-fit-scale is measured by the script; the cap mirrors the text-fit percentage */
    font-size: min(var(--text-fit-scale, 1) * 1em, 300%);
  }
}
```

```js
if (!CSS.supports('text-fit', 'grow per-line-all')) {
  const fit = lockup => {
    const lines = [...lockup.querySelectorAll(':scope > span')];
    // Unscale first: on a refit, offsetWidth would otherwise include the previous scale
    for (const line of lines) line.style.removeProperty('--text-fit-scale');
    // MANDATORY: all reads, then all writes. Interleaving them (e.g. reading
    // lockup.clientWidth inside the write loop) forces one reflow per line.
    const scales = lines.map(line => lockup.clientWidth / line.offsetWidth);
    lines.forEach((line, i) => line.style.setProperty('--text-fit-scale', scales[i]));
  };
  // Refit on resize and font load
  for (const lockup of document.querySelectorAll('.lockup')) {
    new ResizeObserver(() => fit(lockup)).observe(lockup);
  }
}
```

Free lines have no faithful fallback (line breaks are unknown until layout): progressive enhancement to a balanced heading with a fluid base size such as `clamp(2rem, 1rem + 5cqi, 5rem)`. In a mixed lockup the script above still fits the forced lines; a wrapping block measures as wide as the container, so it keeps scale 1 and only gets the fluid base size.

If text fitting is critical, consider using a JS library (e.g. `fitty`), conditionally loaded only if `text-fit` is not supported.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/visual-design/equal-width-text-lines/guide.md#L64-L101). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
