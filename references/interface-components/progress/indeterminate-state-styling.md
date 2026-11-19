### 3. Indeterminate state styling

**Add a custom animation for the indeterminate state:** Turn the fill pseudo-element into a short segment and slide it along the track.
- Style the fill itself; do NOT recreate it as a background on `progress`.
- The indeterminate fill exists only through its animation: the keyframes set its length with a real `inline-size` (this beats Chromium's UA inline `inline-size`) and moves it with `translate`. Do NOT use `scale` for the length; it distorts any pattern painted on the fill.
- `translate` percentages resolve against the fill's own width, so express positions in track units instead: make `progress` an inline-size container and use `cqi` in the keyframes. Include `margin-right: auto` in `from, to` so Chromium lays the fill out at the physical left in RTL too.
- Use transforms, not margins, to move the fill.
  - Transforms keep the animation in the compositor (unless `inline-size` is also being animated)
  - Margins break in RTL, for two separate reasons:
    - Firefox positions the indeterminate fill using only its physical left margin, so `margin-inline-start` has no effect in RTL and the fill never moves.
    - In Chromium and WebKit, which lay the fill out as a normal block, once a margin pushes the fill past the end of the track the margins add up to more than the track. Standard CSS resolves that by ignoring `margin-left` in RTL, so the segment jumps to the edge instead of sliding off it.
  - `translate` is applied after layout, so neither problem applies.
- To mirror the motion in RTL (as Chrome's native bar does), reverse the animation under `:dir(rtl)`:

```css
progress:dir(rtl) {
  --progress-bar-indeterminate-animation: progress-bar-indeterminate var(--progress-bar-indeterminate-animation-duration) infinite linear reverse;
}
```

- Define the public `--progress-bar-indeterminate-*` properties on `progress` (their name already scopes them to the state) so consumers can override them without knowing about `:indeterminate`.
- To vary the segment length (e.g. the leading edge races ahead and the trailing edge catches up), set `--progress-bar-indeterminate-animation` to two concurrent animations: one whose keyframes animate `translate` in `cqi` (position) and one whose keyframes animate `inline-size` (length), so each gets its own keyframes and easing. Do NOT try to shape both edges in a single keyframe list; per-keyframe `animation-timing-function` applies to every property in that keyframe.
- `--progress-bar-animation` applies in both states and can be used for effects such as a determinate shimmer. `revert-rule` is used to only override when it is set, to maximize composability.
- Never disable the indeterminate animation (`animation: none` leaves a zero-width fill in Chromium). For reduced motion, slow it down instead.

```css
progress {
  /* Lets the fill position itself in track units (cqi) */
  container-type: inline-size;
  /* Segment length relative to the track */
  --progress-bar-indeterminate-size: 30%;
  --progress-bar-indeterminate-animation-duration: 1.5s;

  /* Respect prefers-reduced-motion */
  @media (prefers-reduced-motion: reduce) {
    --progress-bar-indeterminate-animation-duration: 10s;
  }
}

progress:indeterminate {
  --progress-bar-animation: var(
      --progress-bar-indeterminate-animation,
      progress-bar-indeterminate var(--progress-bar-indeterminate-animation-duration) infinite linear
    );
}

/* Add to the existing pseudo-element rules */
progress::-webkit-progress-value {
  animation: var(--progress-bar-animation, revert-rule);
}

progress::-moz-progress-bar {
  animation: var(--progress-bar-animation, revert-rule);
}

/* Physical: left to right regardless of direction (reverse under :dir(rtl) to mirror). */
@keyframes progress-bar-indeterminate {
  from, to {
    inline-size: var(--progress-bar-indeterminate-size);
    /* Pin to the physical left; Chromium would otherwise lay the fill out at the inline start */
    margin-right: auto;
  }
  from { translate: -100%; } /* Own width: fully outside the left edge */
  to { translate: 100cqi; }  /* Track width: fully outside the right edge */
}
```

### Additional Accessibility Considerations

In addition to the guidelines mentioned above:
* **Announce completion without stealing focus**: Do not set `tabindex` or call `.focus()` on `<progress>`, as it is non-interactive and moving focus to it disrupts keyboard users. To announce when a background task finishes, update a polite status element (`role="status"` or `aria-live="polite"`).
* **Do not add fallback text inside `<progress>`**: Text inside `<progress>` is ignored by modern browsers and is not used by assistive technologies.
* Avoid `aria-busy` + `aria-describedby` on an unlabeled generic `<div>`. `aria-busy` has inconsistent screen reader support, and `aria-describedby` on an unnamed `<div>` without a role is ignored by assistive technologies. If a region's content is not ready while loading, hide it with `hidden` or `aria-hidden="true"`.
* **DO** ensure proper contrast between the progress bar and track when adding custom styles.
* **Consider alternatives to represent indeterminate state**: Indeterminate progress bar animations displayed in parallel to other content can be considered distracting for some users.

## Fallback strategies

{{ FEATURE_FALLBACKS("accent-color") }}

If `accent-color` is not supported and styling the progress bar is required, use the customized styling method to apply preferred styling to the progress bar.

### Fallbacks & browser support for `revert-rule`

{{ BASELINE_STATUS("revert-rule") }}

If `revert-rule` is not supported, `animation: var(--progress-bar-animation, revert-rule)` falls back to `animation-name: revert-rule` with a `0s` duration when `--progress-bar-animation` is unset, which is a harmless no-op when no `@keyframes revert-rule` exists.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/progress/guide.md#L99-L185). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
