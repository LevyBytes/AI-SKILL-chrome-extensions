Always provide a visible keyboard focus indicator after removing the native appearance. Ensure the focus indicator has a contrast of at least `3:1` with the background color or the adjacent track. Do not use color alone:

```css
input[type="range"]:focus-visible {
  outline: 2px solid var(--slider-fill-color);
  outline-offset: 4px;
}
```

## Style the active track

When the filled portion of the track is styled differently from the unfilled track, Firefox exposes it via `::-moz-range-progress`. WebKit/Blink do not provide an equivalent pseudo-element, so sync the live input value to `--control-value` on `input` events:

```js
const slider = document.querySelector('#range-slider');

function syncSliderValue() {
  slider.style.setProperty('--control-value', slider.value);
}

syncSliderValue();
slider.addEventListener('input', syncSliderValue);
```

## Limitations

- Do not combine WebKit and Firefox pseudo-selectors into a single comma-separated list (e.g. `::-webkit-slider-thumb, ::-moz-range-thumb`); browsers drop the entire rule if an unrecognized vendor pseudo-element is encountered.

## Fallbacks

### Fallbacks & browser support for accent-color

Browser support for accent-color: Limited availability.
Supported by: Chrome 93 (Aug 2021), Edge 93 (Sep 2021), Firefox 92 (Sep 2021), and Safari 26.2 (Dec 2025).

The `accent-color` property is progressive enhancement.
Browsers that do not support this property will ignore it and use their default UI colors.

### Fallbacks & browser support for `progress()` and `attr()`

Baseline status for progress(): Newly available. It's been Baseline since 2026-09-01.
Supported by: Chrome 138 (Jun 2025), Edge 138 (Jun 2025), Firefox 155 (Sep 2026), and Safari 26 (Sep 2025).

When `progress()` is unsupported, compute `--slider-progress` with `calc()`:

```css
@supports not (opacity: progress(1, 0, 100)) {
  input[type="range"] {
    --slider-progress: calc(
      (var(--control-value) - var(--attr-min)) /
      (var(--attr-max) - var(--attr-min)) * 100%
    );
  }
}
```

Browser support for attr(): Limited availability.
Supported by: Chrome 133 (Feb 2025), Edge 133 (Feb 2025), and Firefox 155 (Sep 2026).
Unsupported in: Safari.

When typed `attr()` is unsupported, sync `--attr-min` and `--attr-max` from the input's `min` and `max` attributes in JavaScript:

```js
function syncSliderValue() {
  slider.style.setProperty('--attr-min', slider.min || 0);
  slider.style.setProperty('--attr-max', slider.max || 100);
  slider.style.setProperty('--control-value', slider.value);
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/forms/slider.md#L115-L184). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
