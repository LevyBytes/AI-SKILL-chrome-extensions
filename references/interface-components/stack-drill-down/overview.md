```yaml
---
name: stack-drill-down
description: Build full-screen hierarchical navigation that lets users drill down into nested views and swipe or navigate back to return, with browser history kept in sync.
web-feature-ids:
  - inert
  - intersection-observer
  - scroll-driven-animations
  - scroll-snap
  - scroll-snap-events
---
```

# Stack Drill Down

## Overview

A stack drill-down is a hierarchical navigation pattern, common in mobile apps, where activating a link pushes a new full-screen view on top of the previous one. The view's content is application-defined — a settings sub-page, a thread inside a feed, a folder inside a file browser, a detail page inside a gallery, etc. The user returns by swiping the current view off-screen to the right or by tapping a back button. Browser history stays in sync so the OS-level Back gesture, deep links, and forward/back navigation all work coherently.

This guide implements the stack as:

- A horizontal CSS scroll-snap container where each view is exactly one snap stop. Drilling down appends a new view and smooth-scrolls to it; the swipe-back gesture is handled natively by the browser, giving momentum, velocity, and interruption tracking for free with no pointer-event JavaScript.
- A `scrollsnapchange` event listener on the stack that fires when the snap target changes. This is used as the single source of truth for "the active view changed" — so swipe, click, programmatic scroll, and `popstate` paths all converge in one callback that updates `inert`, restores focus, prunes views the user swiped past, and reconciles browser history.
- A `pushState` / `popstate` integration so every drill-down adds a history entry, the OS-level Back gesture works, and deep links open directly into the right view.
- An (optional) scroll-driven `view()` animation on each view that produces a parallax + dim + shadow effect tied directly to the swipe gesture, so the visible motion is driven by the user's finger, not a tween.

This approach is preferred over JavaScript-driven `transform` animations because the snap mechanism gives the user direct gestural control of the panel's position (their finger drives it, not a tween) and matches the interaction patterns users expect from native mobile apps.

## Implementation

### 1. Markup

The static HTML is just an empty stack container; views are built in JavaScript and appended as the user navigates.

```html
<div class="Stack">
  <!-- Intentionally empty. The initial view is appended by JavaScript
       at init time (step 8). -->
</div>
```

Each view is a `.Stack-view` direct child of `.Stack` (the snap target) with a `.Stack-viewContent` wrapper inside it (where view content lives, and where the parallax transform applies — see step 2). At any moment the stack has one view per active history entry, left-to-right in drill-down order. After the user has drilled in two levels from the root the rendered DOM looks like this:

```html
<div class="Stack">
  <!-- Root view. Has whatever content makes sense as the entry point
       of this section of the app. No back button — there is nothing
       behind the root in the stack. -->
  <div class="Stack-view" inert>
    <!-- tabindex="-1" lets focus move to the root's content when there is
         no link or back button to focus (step 7). -->
    <div class="Stack-viewContent" tabindex="-1">
      <!-- Root content; includes <a href> links that drill in. -->
    </div>
  </div>

  <!-- First-level drill-down view. The user got here by activating a
       link in the root view. -->
  <div class="Stack-view" inert>
    <div class="Stack-viewContent">
      <header>
        <!-- DO include a back button. The swipe gesture is not
             discoverable or available to all users, so keyboard and
             pointer users need an explicit control. Name it after the
             view it returns to (step 7). -->
        <button class="back" aria-label="Back to Inbox"></button>
        <h2>Message</h2>
      </header>
      <main>
        <!-- View content; may include further drill-down <a href> links. -->
      </main>
    </div>
  </div>

  <!-- Second-level drill-down view. Currently visible — no `inert`
       attribute. Same shape as the first-level view. -->
  <div class="Stack-view">
    <div class="Stack-viewContent">
      <header>
        <button class="back" aria-label="Back to Message"></button>
        <h2><!-- ... --></h2>
      </header>
      <main><!-- ... --></main>
    </div>
  </div>
</div>
```

Notes:

- All views except the currently-visible one carry the `inert` attribute. This is applied/removed automatically by the `scrollsnapchange` handler in step 7 — do not set it from your view builders.
- Views the user swipes back past are removed from the DOM (also by step 7) so the stack never grows beyond `currentDepth + 1` children. They are rebuilt on demand from their cached URL paths if forward navigation returns to them.

### 2. Styles


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/stack-drill-down/guide.md#L1-L93). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
