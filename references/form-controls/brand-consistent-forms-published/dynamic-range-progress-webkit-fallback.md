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

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/forms/brand-consistent-forms.md#L236-L255). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
