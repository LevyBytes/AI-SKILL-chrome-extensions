- After untrusted HTML containing a `<script>` element is rendered, the output container contains no `<script>` elements.
- After untrusted HTML containing inline event handlers is rendered, no element in the output container has an `on*` attribute (such as `onclick` or `onerror`).
- Rendering untrusted HTML does not execute any script from the input (no dialogs open and no console messages are logged by the injected markup).
- Safe formatting markup in the input (such as a `<p>` containing a `<b>` element) is rendered as elements in the output container, not as escaped text.
- When `Element.prototype.setHTML` is removed before the page's scripts run, the output container still contains no `<script>` elements and no `on*` attributes after rendering untrusted HTML.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/sanitize-untrusted-html/expectations.md#L1-L5). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
