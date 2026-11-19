Related section: [Devtools](overview.md).
## Important Notes

- DevTools pages exist per-DevTools-window (one per inspected tab)
- They are destroyed when DevTools closes
- `chrome.devtools.*` APIs are ONLY available in the devtools page context, not in the service worker
- Panels can inject scripts into the inspected page via `chrome.devtools.inspectedWindow.eval()`

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/skills-src/chrome-extensions/references/extensions/devtools.md#L97-L102). [Upstream licensing terms](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/README.md#license). Reorganized for this edition.
