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

{{ FEATURE_FALLBACKS("accent-color") }}

### Fallbacks & browser support for `progress()` and `attr()`

{{ BASELINE_STATUS("progress-function") }}

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

{{ BASELINE_STATUS("attr") }}

When typed `attr()` is unsupported, sync `--attr-min` and `--attr-max` from the input's `min` and `max` attributes in JavaScript:

```js
function syncSliderValue() {
  slider.style.setProperty('--attr-min', slider.min || 0);
  slider.style.setProperty('--attr-max', slider.max || 100);
  slider.style.setProperty('--control-value', slider.value);
}
```

{#
## Future standard pseudo-elements

CSS Forms Level 1 specifies standard `::slider-track`, `::slider-thumb`, and
`::slider-fill` pseudo-elements, alongside the `control-value()` function to
query live slider values directly in CSS without JavaScript syncing. When
browser support matures, prefer these native primitives over vendor
pseudo-elements and script-driven CSS custom properties.
#}

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/forms/slider/guide.md#L131-L200). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
