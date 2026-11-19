- The transition from list view to detail view is wrapped in a `document.startViewTransition` call.
- When a thumbnail is clicked, the selected element is assigned a `view-transition-name` (e.g., `hero`) before or during the transition.
- The corresponding hero element in the detail view has the same `view-transition-name` (e.g., `hero`) as the selected thumbnail.
- Only one element in the DOM has a specific `view-transition-name` at any given time.
- After the transition back to the list view is complete, the temporary `view-transition-name` is removed from the list view's thumbnail.
- The title text in both views is assigned a matching `view-transition-name` (e.g., `title`).
- Elements with `view-transition-name` that contain text have `width: fit-content` applied to maintain a stable aspect ratio during transition.
- The old and new view transition pseudo-elements are styled with `height: 100%` to prevent stretching across different aspect ratios.
- All view transition animations are disabled when `prefers-reduced-motion: reduce` is active.
- Programmatic focus MUST be shifted to the newly revealed main heading or active view container after the view transition completes to prevent focus abandonment.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/same-document-transitions/expectations.md#L1-L10). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
