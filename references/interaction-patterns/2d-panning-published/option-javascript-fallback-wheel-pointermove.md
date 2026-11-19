Related section: [2d panning](overview.md).
### Option 2: JavaScript Fallback (`wheel` + `pointermove` with `scrollLeft`/`scrollTop`)

If unrestricted two-dimensional panning across all browsers is required, use `@supports not (scroll-axis-lock: none)` and `CSS.supports('scroll-axis-lock', 'none')` to conditionally intercept `wheel` and pointer drag gestures.

Because `wheel` (`e.deltaX`, `e.deltaY`) and `pointermove` (`e.clientX`, `e.clientY`) expose raw, unlocked 2D deltas before the browser's scrolling engine applies axis-locking, you can apply those deltas directly to `scrollLeft` and `scrollTop`:

- **Why `scrollLeft`/`scrollTop` instead of CSS `transform`**: Updating `scrollLeft` and `scrollTop` keeps the element as a true scroll container. The browser automatically clamps scroll positions to `[0, scrollWidth - clientWidth]` and `[0, scrollHeight - clientHeight]`, native scrollbars stay synchronized, keyboard Arrow-key scrolling continues to work, and `scroll` events and `IntersectionObserver` fire normally.
- **Trade-offs**: Intercepting `wheel` with `{ passive: false }` moves scrolling onto the main thread, and setting `touch-action: pinch-zoom` on touchscreens hands panning to the script, which loses native inertial fling momentum after `pointerup`. `pinch-zoom` keeps pinch-to-zoom working, which `touch-action: none` would also disable.

```css
/* Only disable native touch panning when scroll-axis-lock is unsupported
   and the JavaScript pointer fallback below is active. pinch-zoom keeps
   pinch-to-zoom working. */
@supports not (scroll-axis-lock: none) {
  .pan-viewport {
    touch-action: pinch-zoom;
  }
}
```

```javascript
// Only attach the main-thread gesture fallback when native support is missing
if (!CSS.supports('scroll-axis-lock', 'none')) {
  const viewport = document.querySelector('.pan-viewport');
  let lastPointer = null;

  // 1. Trackpad and mouse wheel fallback
  viewport.addEventListener(
    'wheel',
    (e) => {
      if (e.ctrlKey) return; // Ctrl+wheel and trackpad pinch zoom the page
      e.preventDefault();
      viewport.scrollLeft += e.deltaX;
      viewport.scrollTop += e.deltaY;
    },
    { passive: false },
  );

  // 2. Touch and pointer drag fallback
  viewport.addEventListener('pointerdown', (e) => {
    // Ignore non-primary buttons and clicks on native scrollbars
    const rect = viewport.getBoundingClientRect();
    if (
      !e.isPrimary ||
      e.button !== 0 ||
      e.clientX - rect.left - viewport.clientLeft >= viewport.clientWidth ||
      e.clientY - rect.top - viewport.clientTop >= viewport.clientHeight
    ) {
      return;
    }
    lastPointer = { x: e.clientX, y: e.clientY };
    viewport.setPointerCapture(e.pointerId);
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!lastPointer) return;
    viewport.scrollLeft -= e.clientX - lastPointer.x;
    viewport.scrollTop -= e.clientY - lastPointer.y;
    lastPointer = { x: e.clientX, y: e.clientY };
  });

  const endPointerPan = () => {
    lastPointer = null;
  };
  viewport.addEventListener('pointerup', endPointerPan);
  viewport.addEventListener('pointercancel', endPointerPan);
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/2d-panning.md#L86-L153). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
