### 2. Styling

- Style the track on the `progress` element itself.
- Use the appropriate browser-targeted pseudo-element to target the progress bar itself: `::-webkit-progress-value` for WebKit/Blink and `::-moz-progress-bar` for Firefox.
- MANDATORY: Do NOT group `-webkit-` and `-moz-` pseudo-elements in the same rule. The rule will be deemed invalid and will be ignored. `:is()` and `:where()` do not help here, as they don't support pseudo-elements.
- Each browser-targeted pseudo-element should appear exactly once. State-specific customizations (such as the indeterminate segment size and animation) should be routed through custom properties set on the `progress` element itself.
- Optional: Transition `inline-size` on the fill so determinate value changes animate instead of jumping. Firefox sizes the fill in layout and ignores it, which is harmless.

```css
progress {
  --progress-bar-radius: 1e5px;
  border-radius: var(--progress-bar-radius);
  /* Apply color for custom progress track (background) */
  background: var(--progress-bar-track, var(--color-neutral-90));
  /* Subtle depth on the empty part of the track */
  box-shadow: inset 0 1px 2px rgb(0 0 0 / 0.1);
}

/* Let <progress> styling show through */
progress::-webkit-progress-bar {
  background: transparent;
}

/* Webkit, Chrome */
progress::-webkit-progress-value {
  background: var(--progress-bar-fill, var(--accent-color));
  border-radius: var(--progress-bar-radius);
  transition: inline-size 0.3s;
}

/* Firefox */
progress::-moz-progress-bar {
  background: var(--progress-bar-fill, var(--accent-color));
  border-radius: var(--progress-bar-radius);
  transition: inline-size 0.3s;
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/progress/guide.md#L61-L98). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
