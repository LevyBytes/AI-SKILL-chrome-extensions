### Fallbacks & browser support for focusgroup

{{ BASELINE_STATUS("focusgroup") }}

{# Maintainer note: Use a small capture-phase fallback instead of @microsoft/focusgroup-polyfill, which skips elements inside closed [popover] ancestors, retains references to detached DOM nodes, and misses preventDefault() on arrow keys in older Safari viewports. #}

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

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/scroll-snap-realtime-feedback/guide.md#L176-L224). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
