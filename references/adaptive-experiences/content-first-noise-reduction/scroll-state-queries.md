Related section: [Content first noise reduction](overview.md).
### Scroll-state queries

{{ BASELINE_STATUS("container-scroll-state-queries") }}

Without scroll-state queries, the bar never hides, but it stays compact and usable. If your Baseline target includes those browsers, add a small script so the bar hides there too. Browsers that support other scroll-state queries but not `scrolled` also keep the bar visible.

```css
/* Don't hide the bar while it contains keyboard focus. */
.top-bar.is-hidden:not(:focus-within) {
  transform: translateY(-100%);
}
```

```js
// Runs only where scroll-state queries aren't supported. Run it after .top-bar is parsed (for example, in a module script).
if (!CSS.supports('container-type', 'scroll-state')) {
  const bar = document.querySelector('.top-bar');
  let lastY = scrollY;
  addEventListener('scroll', () => {
    // Clamp so rubber-band overscroll at the top or bottom doesn't flip the scroll direction.
    const y = Math.max(0, Math.min(scrollY, document.documentElement.scrollHeight - innerHeight));
    if (y === lastY) return;
    // Hide only after scrolling down past the bar's own height, so it doesn't flicker near the top.
    bar?.classList.toggle('is-hidden', y > lastY && y > bar.offsetHeight);
    lastY = y;
  }, { passive: true });
}
```

{{ FEATURE_FALLBACKS("popover") }}

### Invoker commands

{{ BASELINE_STATUS("invoker-commands") }}

Browsers without invoker commands ignore `commandfor`, so the button does nothing there. Prefer `popovertarget`, which works wherever popovers do. If you use `commandfor`, dynamically import `invokers-polyfill` (through your bundler, or from a CDN if you don't use one) only when `'commandForElement' in HTMLButtonElement.prototype` is false.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/user-experience/content-first-noise-reduction/guide.md#L91-L126). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
