- The tour step popover must not close when the user clicks on the element it is highlighting.
- The popover must remain in the Top Layer, ensuring it is never obscured by other elements.
- The tour step must correctly follow the anchor element if the window is resized.
- The popover must only close when the user clicks the explicit "Next" or "Close" button.
- The tour step popover MUST set `role="dialog"` and define `aria-labelledby` matching its main heading ID for accessible naming.
- The implementation MUST programmatically route keyboard focus inside the tour step popover immediately upon opening.
- The tour step popovers must not be modal.
- When a tour step popover is dismissed, it should move focus to the related functionality.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/persistent-app-tours/expectations.md#L1-L8). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
