- INP subparts (`inputDelay`, `processingDuration`, `presentationDelay`) are provided.
- The `longestScript.entry` object may be empty and this should be handled.
- Style and layout durations from Long Animation Frames (`styleDuration`, `layoutDuration`, `forcedStyleDuration`, `forcedLayoutDuration`, or combined fallbacks `forcedStyleAndLayoutDuration` / `totalStyleAndLayoutDuration`) are reported.
- The `web-vitals` library, or some other RUM library, is used rather than trying to re-implement INP.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/identify-inp-causes/expectations.md#L1-L4). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
