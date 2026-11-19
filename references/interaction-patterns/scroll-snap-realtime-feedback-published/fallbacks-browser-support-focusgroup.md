### Fallbacks & browser support for focusgroup

Browser support for focusgroup: Limited availability.
Supported by: Chrome 150 (Jun 2026) and Edge 150 (Jul 2026).
Unsupported in: Firefox and Safari.

Keep `focusgroup="toolbar wrap"` in the markup. If `'focusGroup' in HTMLElement.prototype` is false, implement a roving tabindex pattern on the gallery controls, and manually apply a `role="toolbar"` to the container. Never install it when native focusgroup is present.

```js
if (!('focusGroup' in HTMLElement.prototype)) {
  document.querySelectorAll('[focusgroup~="toolbar"]').forEach(group => {
    group.setAttribute('role', 'toolbar');

    const items = () => [...group.querySelectorAll('button')]
      .filter(item => item.closest('[focusgroup]') === group)
      .filter(item => !item.disabled && item.getAttribute('aria-disabled') !== 'true');

    const syncTabIndex = () => {
      const list = items();
      let current = list.indexOf(document.activeElement);

      if (current < 0) {
        current = list.indexOf(list.find(item => item.getAttribute('aria-current') === 'true'));
      }

      list.forEach((item, index) => {
        item.tabIndex = current === index ? 0 : -1;
      });
    };

    group.addEventListener('focusin', syncTabIndex);
    group.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      const list = items();
      const current = list.indexOf(document.activeElement);
      if (current < 0) return;
      const next = (current + (event.key === 'ArrowLeft' ? -1 : 1) + list.length) % list.length;
      event.preventDefault();
      event.stopImmediatePropagation();
      list.forEach((item, index) => {
        item.tabIndex = index === next ? 0 : -1;
      });
      list[next].focus({ preventScroll: true });
    }, true);

    syncTabIndex();
  });
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/scroll-snap-realtime-feedback.md#L171-L219). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
