## Accessibility considerations

If creating a carousel or gallery pattern, which has associated controls for navigation:

1. Ensure that parity is maintained between the controls that relate to the scroll container, and the content displayed in the scroll container. The correct state of the associated controls must be updated (using `aria-current="true"`) as the scroll container updates, so that people can determine the current content.
2. Wrap the entire component in a `<section>` element, with an accessible name. Give the element a `focusgroup="toolbar wrap"` property, updating the value to match the visual design used. This will manage focus and provide a roving tabindex behaviour for the controls.
3. Ensure that the name for the button matches the text/description in the scroll-container that it controls. This way, people reading through the content can understand the relationship between the control and the content it displays.

> [!NOTE]
> This pattern does not represent a traditional carousel component in which slides typically automatically change, in a way that doesn't allow people to pause or stop the transition, or accurately communicate the visible information to people using screen readers. If the intended use case is a carousel that only presents a single slide at any time and automatically transitions between slides, then do not use this technique, as it lacks the accessibility information required for such a component. Instead, opt for a tab-like implementation, ensuring that the carousel can be operated using a keyboard alone, that the carousel can be paused or stopped, and that the semantic information including the name, role, and state, is accurately conveyed to people using screen readers. Making carousel components accessible to everyone is highly nuanced and context-dependent; be sure to refer to established accessibility standards and perform thorough user testing for production environments.

To ensure consistent operability across different browsers and assistive technology combinations, ensure that the scrollable container can receive focus (by applying `tabindex="0"`), and has an accessible name that describes the content, along with an appropriate role (such as `role="region"`).

## Fallback strategies
Browser support for Scroll snap events: Limited availability.
Supported by: Chrome 129 (Sep 2024) and Edge 129 (Sep 2024).
Unsupported in: Firefox and Safari.

Baseline status for Scroll snap: Widely available. It's been Baseline since 2020-01-15.
Supported by: Chrome 69 (Sep 2018), Edge 79 (Jan 2020), Firefox 68 (Jul 2019), and Safari 11 (Sep 2017).

For browsers that do not support `scrollsnapchanging`, the UI will not provide eager feedback during the scroll gesture by default, and the linked UI will desynchronize from the content.

**MANDATORY:** Provide a fallback for browsers without support, or the linked UI will desynchronize from the content.

**DO** simulate the real-time nature of `scrollsnapchanging` with a `scroll` event listener coupled with `requestAnimationFrame` and geometric distance calculations to determine the closest snap target while the user is actively scrolling.

```javascript
if ('onscrollsnapchanging' in Element.prototype) {
  // Use native scroll snap events
} else {
  // Fallback: use scroll + requestAnimationFrame for eager feedback
  // (assumes the same container, thumbnails, items defined in step 1)
  let scrollTimeout;
  let rafId = null;

  const promotePendingToActive = () => {
    const closestIndex = findClosestItemIndex();
    if (!thumbnails[closestIndex]) return;
    thumbnails.forEach((thumb) => {
      thumb.classList.remove('pending', 'active');
      thumb.removeAttribute('aria-current');
    });
    thumbnails[closestIndex].classList.add('active');
    thumbnails[closestIndex].setAttribute('aria-current', 'true');
  };

  container.addEventListener('scroll', () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      const closestIndex = findClosestItemIndex();
      if (!thumbnails[closestIndex]) return;

      // DO NOT forget to clean up stale pending classes
      thumbnails.forEach((thumb) => thumb.classList.remove('pending'));
      thumbnails[closestIndex].classList.add('pending');
    });

    // Debounce fallback for browsers that don't support scrollend
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(promotePendingToActive, 100);
  }, { passive: true });

  // Fallback: use Baseline `scrollend` event to promote pending to active cleanly where supported
  container.addEventListener('scrollend', () => {
    clearTimeout(scrollTimeout);
    promotePendingToActive();
  });
}
```

The geometric `scroll` + `requestAnimationFrame` fallback closely emulates the behavior of native snap prediction, including handling programmatic scrolling correctly. Because functions like `scrollIntoView` naturally fire `scroll` events during their execution, the UI will stay smoothly synchronized throughout the scroll animation without requiring additional custom logic.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/scroll-snap-realtime-feedback.md#L97-L170). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
