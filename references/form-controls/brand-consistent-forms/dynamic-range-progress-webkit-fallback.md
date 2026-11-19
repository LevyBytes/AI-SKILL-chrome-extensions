### Dynamic Range Progress in Webkit Fallback

To make the progress fill move with the thumb on a range slider in Webkit browsers (without `accent-color`), you can use a CSS variable and a small amount of JavaScript.

1. **Update CSS**: Use a CSS variable for the gradient stop:
```css
input[type="range"]::-webkit-slider-runnable-track {
  background: linear-gradient(to right, var(--brand-color) var(--progress, 0%), #ccc var(--progress, 0%));
}
```

2. **Add JavaScript**: Update the variable on the `input` event:
```javascript
if (!CSS.supports('accent-color')) {
  const slider = document.getElementById('volume');
  slider.addEventListener('input', (e) => {
    e.target.style.setProperty('--progress', `${e.target.value}%`);
  });
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/forms/brand-consistent-forms/guide.md#L242-L261). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
