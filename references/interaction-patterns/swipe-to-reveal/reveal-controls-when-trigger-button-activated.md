### Step 3: Reveal controls when trigger button is activated

Because the buttons or links inside `.SwipeReveal-panel` are off-screen at rest and do not receive focus by default (due to the `tabindex="-1"` attributes), when the corresponding trigger button is activated, we need to ensure that they are revealed as expected. When this happens, we also need to set the `tabindex` attributes to be `tabindex="0"` so that people can move to them and interact with them, and set the `aria-expanded` attribute on the trigger control to be `aria-expanded="true"`. When the trigger control is interacted with when the controls are already revealed, these changes should be reversed.

```js
for (const trigger of document.querySelectorAll('.SwipeReveal-content [aria-label$="actions"]')) {
  trigger.addEventListener('click', () => {
    const reveal = trigger.closest('.SwipeReveal');
    if (!reveal) return;

    const label = (trigger.getAttribute('aria-label') || '').toLowerCase();
    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      if (label.includes('leading')) {
        let leadingScrollPanelWidth = reveal.querySelector('.SwipeReveal-panel').offsetWidth;
        reveal.scrollTo({
          left: leadingScrollPanelWidth,
          behavior: 'smooth',
        });
      } else if (label.includes('trailing')) {
        let leadingScrollPanelWidth = reveal.querySelector('.SwipeReveal-panel').offsetWidth;
        reveal.scrollTo({
          left: leadingScrollPanelWidth,
          behavior: 'smooth',
        });
      } else {
        reveal.scrollTo({
          left: 0,
          behavior: 'smooth',
        });
      }

      for (const actionButton of reveal.querySelectorAll('[aria-label$="actions"]')) {
        actionButton.setAttribute('aria-expanded', 'false');
      }
      setActionTabIndexes(reveal, false);
      return;
    }

    const panels = Array.from(reveal.querySelectorAll('.SwipeReveal-panel'));
    if (panels.length === 0) return;

    let targetScrollLeft = reveal.scrollWidth;

    if (label.includes('leading')) {
      targetScrollLeft = 0;
    } else if (label.includes('trailing')) {
      targetScrollLeft = reveal.scrollWidth;
    } else if (panels.length === 1) {
      targetScrollLeft = reveal.scrollWidth;
    } else {
      const content = reveal.querySelector('.SwipeReveal-content');
      const firstTrigger = content.querySelector('[aria-label$="actions"]');
      targetScrollLeft = trigger === firstTrigger ? 0 : reveal.scrollWidth;
    }

    reveal.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth',
    });

    for (const actionButton of reveal.querySelectorAll('[aria-label$="actions"]')) {
      actionButton.setAttribute('aria-expanded', actionButton === trigger ? 'true' : 'false');
    }
    setActionTabIndexes(reveal, true);
  });
}
```

Along with this, use {{ GUIDE_REF('scroll-snap-realtime-feedback') }} to ensure that the accessibility state information is kept up to date, if someone swipes open the associated content, rather than triggering it directly with the button.

## Best practices and pitfalls

- **DO** use `scroll-snap-type: x mandatory` rather than `proximity`. With `proximity`, a light swipe can leave the action buttons or side menu partially exposed at rest.
- **DO** set `overscroll-behavior: chain` on the outer horizontal swipe-to-reveal scroller (`.SwipeReveal`) so scroll can chain into the parent scroller without the revealed menu or action strip bouncing.
- **DO** leave `overscroll-behavior: auto` (the default) on inner scrollable content panes (`.SwipeReveal-content.is-scrollable`) where you want normal bounce feedback to happen while still chaining horizontal swipes to the outer swipe scroller.
- **DO** implement revealed actions and side-menu items as real focusable DOM controls (`<button>`, `<a>`). When `.SwipeReveal-content` is focusable or contains focusable controls, pair a `focusin` listener with `event.target.matches(':focus-visible')` to call `scrollIntoView({ block: 'nearest', inline: 'start' })` so tabbing back into the content pane closes the side panel without affecting pointer interactions.
- **DO NOT** intercept `wheel`, `touchmove`, or `pointermove` events in JavaScript to manually translate the content or emulate scroll chaining. Main-thread gesture interception blocks compositor-driven scrolling, breaks native scroll momentum, and degrades responsiveness.

## Accessibility considerations

To adhere to WCAG 2.5.1 Pointer Gestures, functionality must not be available solely through swiping gestures. Visible button elements are an accessible alternative way to activate the same functionality. Buttons provide people with disabilities, particularly people using voice control software, with a usable way of activating the same functionality. Make each button at least 24×24 CSS pixels (WCAG 2.5.8 Target Size (Minimum)) and ensure that there's a way of moving focus to the button and operating it using a keyboard alone.

Another way of adhering to the 2.5.1 Pointer Gestures success criterion is by ensuring that the functionality exists elsewhere. For example, in an email app's inbox, if the email can be swiped left to be favourited, but this can also be achieved via a "Favourite email" button after navigating to an email, this would be sufficient. If the intended use case may require many repeated actions, this approach will be less usable, as it would require people with disabilities to have to spend more time accessing the alternative control. Operating system or browser features (such as a long press on iOS) can also be a sufficient alternative, but are often not as discoverable as permanently visible buttons.

## Fallback

{{ BASELINE_STATUS("scroll-initial-target") }}

When a `.SwipeReveal` container places a `.SwipeReveal-panel` on the left (`inline-start`) side before `.SwipeReveal-content`, browsers that do not support `scroll-initial-target: nearest` will initially render at scroll offset `0` with the leading panel exposed.

If your Baseline target does not support `scroll-initial-target`, detect support with `CSS.supports('scroll-initial-target', 'nearest')` and call `scrollTo()` with `behavior: 'instant'` on `load` so containers with a leading panel jump straight to `.SwipeReveal-content` without scrolling the page:



GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/swipe-to-reveal/guide.md#L122-L215). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
