#### Animation fallback

{{ BASELINE_STATUS("registered-custom-properties") }}

If `@property` is not supported, the ring will jump to the new value instantly instead of transitioning smoothly. In most cases this is fine, and does not break any functionality.

If the transition is absolutely necessary, you can check for `@property` support and use a `requestAnimationFrame()` loop to interpolate `--value` in older browsers.

{{ BASELINE_STATUS("background-clip-border-area") }}

For browsers that don't yet support `background-clip: border-area`, fall back to a `mask-image` to hollow out the center of the `<progress>` element.

```css
@supports not (background-clip: border-area) {
  mask-image: radial-gradient(
    transparent calc(50% - var(--thickness)),
    black calc(50% - var(--thickness) + 0.5px)
  );
  border: 0;
}
```

{{ BASELINE_STATUS("attr") }}

For browsers that don't support the `attr()` CSS function for any property, use a `MutationObserver` to automatically sync the `value` attribute to the `--value` custom property.

```js
if (!CSS.supports("width: attr(value type(<number>))")) {
  const observer = new MutationObserver(() => {
    progress.style.setProperty("--value", progress.getAttribute("value"));
  });
  observer.observe(progress, {
    attributes: true,
    attributeFilter: ["value"],
  });
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/progress-ring/guide.md#L164-L200). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
