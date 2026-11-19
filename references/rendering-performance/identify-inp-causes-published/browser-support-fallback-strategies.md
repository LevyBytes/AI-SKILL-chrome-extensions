Related section: [Identify inp causes](overview.md).
## Browser support and fallback strategies

Baseline status for Event timing performance entries: Newly available. It's been Baseline since 2025-12-12.
Supported by: Chrome 76 (Jul 2019), Edge 79 (Jan 2020), Firefox 89 (Jun 2021), and Safari 26.2 (Dec 2025).

The Event Timing API is available in most modern browsers and is necessary to calculate INP and the INP subparts. For browsers that do not support this API INP cannot be measured.

Browser support for Long animation frames performance entries: Limited availability.
Supported by: Chrome 123 (Mar 2024) and Edge 123 (Mar 2024).
Unsupported in: Firefox and Safari.

The Long Animation Frames API provides optional, additional details. It can be safely used without fallbacks. In most cases the performance opportunities it identifies will apply to other browsers as well.

If your Baseline target supports the Long Animation Frames API (`long-animation-frames`) but does not support separate style and layout duration properties (`styleDuration` and `layoutDuration` on `PerformanceLongAnimationFrameTiming`, or `forcedStyleDuration` and `forcedLayoutDuration` on `PerformanceScriptTiming`), fall back to the combined style-and-layout timings:
- Use `script.forcedStyleAndLayoutDuration` on `PerformanceScriptTiming` for synchronous forced style and layout work inside scripts.
- Use `metric.attribution.totalStyleAndLayoutDuration` in `web-vitals/attribution` (or compute `(entry.paintTime || entry.startTime + entry.duration) - entry.styleAndLayoutStart` on each `PerformanceLongAnimationFrameTiming` entry) for combined style and layout work.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/performance/identify-inp-causes.md#L90-L105). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
