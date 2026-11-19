#### Animation fallback

Baseline status for Registered custom properties: Newly available. It's been Baseline since 2024-07-09.
Supported by: Chrome 85 (Aug 2020), Edge 85 (Aug 2020), Firefox 128 (Jul 2024), and Safari 16.4 (Mar 2023).

If `@property` is not supported, the ring will jump to the new value instantly instead of transitioning smoothly. In most cases this is fine, and does not break any functionality.

If the transition is absolutely necessary, you can check for `@property` support and use a `requestAnimationFrame()` loop to interpolate `--value` in older browsers.

Browser support for background-clip: border-area: Limited availability.
Supported by: Chrome 150 (Jun 2026), Edge 150 (Jul 2026), and Safari 18.2 (Dec 2024).
Unsupported in: Firefox.

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

Browser support for attr(): Limited availability.
Supported by: Chrome 133 (Feb 2025), Edge 133 (Feb 2025), and Firefox 155 (Sep 2026).
Unsupported in: Safari.

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

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/progress-ring.md#L152-L193). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
