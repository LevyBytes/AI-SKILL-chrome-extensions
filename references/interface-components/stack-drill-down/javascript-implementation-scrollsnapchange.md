```js
function onActiveViewChanged(currentView) {
  // Note whether focus is in the stack before views are made inert or
  // removed, so the focus fallback below only moves focus that would
  // otherwise be lost, and never moves it on page load.
  const focusWasInStack = stack.contains(document.activeElement);

  // Walk the stack in DOM order to update each view's role:
  //  - Views at or before currentView stay in the DOM but get
  //    `inert` (except currentView) so focus, pointer events, and
  //    AT navigation cannot leak into views hidden behind the
  //    parallax.
  //  - Views after currentView are unreachable (the user swiped
  //    back past them) so we drop them from the DOM to free memory.
  //    Their urlPath stays in entriesByDepth so a later forward
  //    navigation can rebuild the view from scratch.
  let seenCurrent = false;
  for (const view of [...stack.children]) {
    if (seenCurrent) {
      for (const e of entriesByDepth.values()) {
        if (e.view === view) e.view = null;
      }
      view.remove();
    } else {
      // MANDATORY: inert non-current views. Without this, tabbing
      // and screen-reader navigation can reach content hidden behind
      // the parallax — a severe accessibility failure that's
      // invisible to sighted users.
      view.toggleAttribute('inert', view !== currentView);
      if (view === currentView) seenCurrent = true;
    }
  }

  // If the visible view's depth doesn't match `currentDepth`, the
  // user got here by swiping (not clicking) — sync history so the
  // browser back/forward buttons stay coherent with what's on screen.
  let currentViewDepth;
  for (const [d, e] of entriesByDepth) {
    if (e.view === currentView) currentViewDepth = d;
  }
  if (currentViewDepth !== undefined && currentViewDepth !== currentDepth) {
    // history.go fires popstate, which re-enters updateFromHistoryState.
    // That call's fromIdx === toIdx check bails out without scrolling.
    history.go(currentViewDepth - currentDepth);
  }

  // Name the active view in the title, and use the app name alone for the
  // root. Each drill-down adds a history entry, and the title is what the
  // history list, the tab and screen readers use to tell them apart.
  // ('Mail' is an example app name.)
  const viewTitle = currentView.querySelector('h2')?.textContent;
  document.title = viewTitle ? `${viewTitle} | Mail` : 'Mail';

  // Name the back button after the view it returns to: the previous view
  // in the stack, or the root view after a deep link. Focus lands on it
  // after a drill-down, so "Back" alone tells screen reader users nothing
  // about where they are. ('Inbox' is the example root title.)
  const back = currentView.querySelector('.back');
  if (back) {
    const parentTitle =
      currentView.previousElementSibling?.querySelector('h2')?.textContent ?? 'Inbox';
    back.setAttribute('aria-label', `Back to ${parentTitle}`);
  }

  // Restore focus on the now-active view:
  //  - If we recorded which link the user activated to drill out
  //    of this view, return focus there so a swipe-back lands them
  //    exactly where they left off.
  //  - Otherwise (a freshly-pushed drill-down view), move focus to
  //    the back button so keyboard users have an obvious next action.
  //  - preventScroll is REQUIRED: without it, .focus() scrolls the
  //    snap container to bring the focused element into view, which
  //    fights the snap and can land the user mid-snap.
  const stored = returnFocus.get(currentView);
  if (stored?.isConnected) {
    stored.focus({preventScroll: true});
    returnFocus.delete(currentView);
  } else if (currentView !== rootView) {
    currentView.querySelector('.back')?.focus({preventScroll: true});
  } else if (focusWasInStack && !currentView.contains(document.activeElement)) {
    // The root has no back button, and after a deep link or a pruned view
    // there is no stored link either, so focus the root's content. Otherwise
    // focus would stay in a removed or inert view and fall to <body>, and
    // keyboard and screen reader users would restart from the top of the page.
    currentView.querySelector('.Stack-viewContent')?.focus({preventScroll: true});
  }
}

stack.addEventListener('scrollsnapchange', (event) => {
  // snapTargetInline is the element that was just snapped to on the
  // inline (horizontal) axis. For this stack — where each view is one
  // horizontal snap stop — that's the new active view.
  onActiveViewChanged(event.snapTargetInline);
});
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/stack-drill-down/guide.md#L513-L608). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
