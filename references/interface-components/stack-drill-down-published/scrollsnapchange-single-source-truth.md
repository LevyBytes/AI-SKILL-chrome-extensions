### 7. `scrollsnapchange`: the single source of truth

After every snap commit — whether triggered by a swipe, a click, or a programmatic scroll — the browser fires a `scrollsnapchange` event on the scroll container, with the newly snapped element exposed as `event.snapTargetInline` (for horizontal snapping). Putting all state transitions inside this one handler is what keeps the swipe path, the click path, and the `popstate` path coherent.

The handler is extracted into a standalone `onActiveViewChanged` function so the fallback (see "Fallback strategies" below) can reuse it without duplicating the logic.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/stack-drill-down.md#L496-L501). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
