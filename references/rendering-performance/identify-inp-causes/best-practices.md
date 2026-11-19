Related section: [Identify inp causes](overview.md).
## Best Practices

- **DO** use INP subparts initially to identify whether the delay is already running JavaScript (input delay), the event handlers JavaScript for the interaction (processing duration), or the subsequent rendering (presentation delay).
- **DO** attempt to identify the biggest blocking JavaScript as additional detail, particularly for input delay, and processing duration.
- **DO** distinguish between style recalculation (`styleDuration`, `forcedStyleDuration`) and layout (`layoutDuration`, `forcedLayoutDuration`) when diagnosing high processing duration or presentation delay: high style times indicate expensive CSS selectors or broad invalidations, while high layout times indicate DOM geometry bottlenecks or synchronous layout thrashing.
- **DO** prefer the Long Animation Frames API for providing this further detail over alternatives like the JS Self-Profiling API, which carries higher runtime overhead.
- **DO** use the `web-vitals` library if no other RUM solution is in place. It can identify the INP interaction and includes information about the subparts and the scripts that were executed during the interaction (using the Long Animation Frames API).
- **DO** beacon back the required information to an analytics service rather than just log it locally.

## Browser support and fallback strategies

{{ BASELINE_STATUS("event-timing") }}

The Event Timing API is available in most modern browsers and is necessary to calculate INP and the INP subparts. For browsers that do not support this API INP cannot be measured.

{{ BASELINE_STATUS("long-animation-frames") }}

The Long Animation Frames API provides optional, additional details. It can be safely used without fallbacks. In most cases the performance opportunities it identifies will apply to other browsers as well.

{# {{ BASELINE_STATUS("tmp-long-animation-frames-style-layout") }} #}

If your Baseline target supports the Long Animation Frames API (`long-animation-frames`) but does not support separate style and layout duration properties (`styleDuration` and `layoutDuration` on `PerformanceLongAnimationFrameTiming`, or `forcedStyleDuration` and `forcedLayoutDuration` on `PerformanceScriptTiming`), fall back to the combined style-and-layout timings:
- Use `script.forcedStyleAndLayoutDuration` on `PerformanceScriptTiming` for synchronous forced style and layout work inside scripts.
- Use `metric.attribution.totalStyleAndLayoutDuration` in `web-vitals/attribution` (or compute `(entry.paintTime || entry.startTime + entry.duration) - entry.styleAndLayoutStart` on each `PerformanceLongAnimationFrameTiming` entry) for combined style and layout work.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/identify-inp-causes/guide.md#L90-L113). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
