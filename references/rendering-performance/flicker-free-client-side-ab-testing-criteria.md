- The experiment script is placed in the document `<head>`.
- The experiment script has the `blocking="render"` attribute.
- The experiment script has either `async` or `type="module"` set (to avoid blocking parsing).
- The page does not visually flicker or flash between the control and variant states on initial load.
- The variant styling is applied before the browser paints any content to the screen.
- A fallback anti-flicker mechanism is included for browsers that do not support `blocking="render"`, using feature detection `!Object.hasOwn(HTMLScriptElement.prototype, 'blocking')`.
- No anti-flicker snippet (opacity: 0 hack) is used when `blocking="render"` is supported by the browser.
- The fallback includes a safety timeout to prevent an indefinitely blank page if the experiment script fails to load.
- The `blocking="render"` attribute is NOT applied to non-visual scripts (analytics, tracking, etc.).
- Only scripts in the `<head>` use `blocking="render"`.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/flicker-free-client-side-ab-testing/expectations.md#L1-L10). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
