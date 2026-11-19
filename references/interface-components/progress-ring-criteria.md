# Expectations

- The component contains a native HTML `<progress>` element.
- The component is visible on the page.
- The visual progress ring is implemented using a CSS `conic-gradient`.
- The center of the progress ring is transparent or "hollowed out" using `background-clip: border-area`.
- If `background-clip: border-area` is not supported, fall back to hollowing out the center of the ring with a radial gradient mask. 
- The `value` attribute on `<progress>` is used to drive the visual progress of the ring using `attr()`.
- If using `attr()` on non-content properties is not supported, fallback to update the visual ring using a `MutationObserver` that monitors the `value` attribute and updates the `--value` property.
- The component supports displaying text content (e.g., the percentage) in the center of the ring.
- The ring smoothly transitions between values when the `--value` property is updated (requiring `@property` support in the browser).
- The `<progress>` element includes an `aria-label` for accessibility.
- The component has a distinct visual "track" (background) behind the progress fill.
- The progress ring respects `prefers-reduced-motion` by changing to a new value immediately, rather than having a smooth transition.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/progress-ring/expectations.md#L1-L14). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
