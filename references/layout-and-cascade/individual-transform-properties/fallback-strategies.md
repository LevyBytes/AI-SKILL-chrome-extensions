Related section: [Individual transform properties](overview.md).
### Fallback strategies

{{ BASELINE_STATUS("individual-transforms") }}

For browsers that do not support individual transform properties, use the traditional `transform` property. Note that this requires re-declaring the entire transform stack if you want to modify one part in a different state.

```css
.element {
  /* Base transform */
  transform: translate(100px, 0) rotate(45deg);
  /* Specify the identity for the scale property. */
  scale: 1;
}

@supports not (translate: 0px) {
  .element:hover {
    /* Fallback: Must repeat translate and rotate even if only scale changes */
    transform: translate(100px, 0) rotate(45deg) scale(1.1);
  }
}

@supports (translate: 0px) {
  .element:hover {
    /* Modern: Only declare the change */
    scale: 1.1;
  }
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/css/individual-transform-properties/guide.md#L73-L100). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
