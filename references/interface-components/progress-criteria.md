- The implementation uses the semantic `<progress>` element.
- The determinate progress bar sets the `value` attribute (and `max` when using a scale other than the default `0` to `1`).
- The indeterminate progress bar state is achieved by omitting the `value` attribute.
- Each progress bar is associated with a descriptive label (via `<label for="...">`, `aria-labelledby`, or `aria-label`).
- The `<progress>` element does not include fallback text content inside the element.
- Custom styles normalize the element using `appearance: none` and `border: 0`.
- Custom styles are provided for browser-specific pseudo-elements (`::-webkit-progress-bar`, `::-webkit-progress-value`, and `::-moz-progress-bar`) using separate (un-grouped) `-webkit-` and `-moz-` selector rules.
- The custom indeterminate animation respects the `prefers-reduced-motion: reduce` media query by slowing down or dampening the animation rather than disabling it entirely.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/progress/expectations.md#L1-L9). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
