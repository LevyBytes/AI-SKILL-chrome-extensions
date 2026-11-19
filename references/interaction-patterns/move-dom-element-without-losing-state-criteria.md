* The document contains a script that performs DOM reparenting.
* The script contains a feature detection check for `moveBefore` to safely handle unsupported browsers.
* The script uses `moveBefore` to move a stateful element (e.g., an element containing an iframe, input, video, or audio) to a new parent if the feature is supported.
* The script falls back to using `insertBefore` or `appendChild` if `moveBefore` is not supported.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/move-dom-element-without-losing-state/expectations.md#L1-L4). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
