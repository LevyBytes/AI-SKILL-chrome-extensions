Related section: [Interest triggered tooltips](overview.md).
## Fallback strategies

{{ FEATURE_FALLBACKS("interest-invokers") }}

{{ FEATURE_FALLBACKS("popover") }}

### Fallbacks & browser support for `popover="hint"`

{{ BASELINE_STATUS("popover-hint") }}

The `@oddbird/popover-polyfill` package does not polyfill `popover="hint"` in browsers that already support native `popover` (`auto` and `manual`). In those browsers, the unrecognized `"hint"` value defaults to `popover="manual"` (the HTML invalid value default), so a tooltip opened via keyboard focus may remain open if a second tooltip is opened via pointer hover unless explicitly dismissed on loss of interest by the invoker.

A toggletip can also be opened by click, with no interest to lose, so a `manual` fallback would never close. Where `hint` is unsupported, switch toggletips to `popover="auto"` as they open. This MUST happen in `beforetoggle`: the browser reads the popover type after that event, whereas changing the type of an already open popover closes it. `beforetoggle` does not bubble, so delegate with a capturing listener:

```js
// The `popover` property reports the state the browser actually uses: "manual" when `hint` is unsupported.
const probe = document.createElement("div");
probe.popover = "hint";
if (probe.popover !== "hint") {
  document.addEventListener("beforetoggle", ({ target, newState }) => {
    const toggletip = target.getAttribute("popover") === "hint"
      && document.querySelector(`[popovertarget="${CSS.escape(target.id)}"]`);
    if (newState === "open" && toggletip) {
      target.popover = "auto";
    }
  }, true);
}
```

{{ FEATURE("anchor-positioning", "popover-fallbacks") }}

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/interest-triggered-tooltips/guide.md#L93-L122). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
