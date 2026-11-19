### Step 2: Configure the track as a horizontal snap container with three snap points

The track has three full-width columns: a left spacer (`::before`), the content, and a right spacer (`::after`). Snapping to a spacer means the content is fully off-screen, which is the rest position after a committed swipe.

The track configuration is gated behind an `.is-initialized` class on the list item. Before JS upgrades the row, the item just renders as plain content with no horizontal scroller. The class is added in Step 4 once the JavaScript that detects swipes has been wired up. This ensures the user cannot swipe before the functionality is ready.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/swipe-to-remove/guide.md#L62-L67). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
