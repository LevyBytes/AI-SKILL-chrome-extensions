# CSS `accent-color` property

## Issues

Browser rendering of `accent-color` varies.
For indicators generally painted over an accent color background, such as checkbox marks and radio-button dots, browsers may apply different treatments:
- **Chromium** and **Firefox** generally select a contrasting indicator color.
- **Safari** may instead preserve a white indicator in light mode or a black indicator in dark mode, while modifying the accent color behind it. This adjustment does not always provide sufficient contrast for every supplied color, so test important combinations in Safari, including both light and dark color schemes. Do not assume that Safari will automatically choose whichever indicator color provides the best contrast.

## Fallbacks

The `accent-color` property is progressive enhancement.
Browsers that do not support this property will ignore it and use their default UI colors.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/features/accent-color.md#L1-L14). [Upstream licensing terms](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/README.md#license). Reorganized for this edition.
