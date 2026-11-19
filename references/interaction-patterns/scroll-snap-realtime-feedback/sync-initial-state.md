### 3. Sync initial state
When the page loads, the scroll position might be restored by the browser (e.g., via history traversal or an anchor link). Neither `scrollsnapchange` nor `scroll` events will fire automatically. Run a one-off geometric check to sync the UI with the initial scroll position.

```javascript
// Note: For item.offsetLeft to be relative to the container, 
// the container MUST be the offsetParent (e.g., `position: relative`).
const findClosestItemIndex = () => {
  // Center-distance assumes scroll-snap-align: center on items.
  // For start-aligned snap, compare scrollLeft to item.offsetLeft directly.
  const containerCenter = container.scrollLeft + container.clientWidth / 2;
  let closestIndex = 0;
  let minDistance = Infinity;

  items.forEach((item, index) => {
    const itemCenter = item.offsetLeft + item.offsetWidth / 2;
    const distance = Math.abs(containerCenter - itemCenter);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index;
    }
  });
  return closestIndex;
};

const initActiveItem = () => {
  const closestIndex = findClosestItemIndex();
  if (!thumbnails[closestIndex]) return;

  thumbnails.forEach((thumb) => {
    thumb.classList.remove('pending', 'active');
    thumb.removeAttribute('aria-current');
  });
  thumbnails[closestIndex].classList.add('active');
  thumbnails[closestIndex].setAttribute('aria-current', 'true');
};

if (document.readyState === 'complete') {
  initActiveItem();
} else {
  window.addEventListener('load', initActiveItem, { once: true });
}
```

## Accessibility considerations

If creating a carousel or gallery pattern, which has associated controls for navigation:

1. Ensure that parity is maintained between the controls that relate to the scroll container, and the content displayed in the scroll container. The correct state of the associated controls must be updated (using `aria-current="true"`) as the scroll container updates, so that people can determine the current content.
2. Wrap the entire component in a `<section>` element, with an accessible name. Give the element a `focusgroup="toolbar wrap"` property, updating the value to match the visual design used. This will manage focus and provide a roving tabindex behaviour for the controls.
3. Ensure that the name for the button matches the text/description in the scroll-container that it controls. This way, people reading through the content can understand the relationship between the control and the content it displays.

> [!NOTE]
> This pattern does not represent a traditional carousel component in which slides typically automatically change, in a way that doesn't allow people to pause or stop the transition, or accurately communicate the visible information to people using screen readers. If the intended use case is a carousel that only presents a single slide at any time and automatically transitions between slides, then do not use this technique, as it lacks the accessibility information required for such a component. Instead, opt for a tab-like implementation, ensuring that the carousel can be operated using a keyboard alone, that the carousel can be paused or stopped, and that the semantic information including the name, role, and state, is accurately conveyed to people using screen readers. Making carousel components accessible to everyone is highly nuanced and context-dependent; be sure to refer to established accessibility standards and perform thorough user testing for production environments.

To ensure consistent operability across different browsers and assistive technology combinations, ensure that the scrollable container can receive focus (by applying `tabindex="0"`), and has an accessible name that describes the content, along with an appropriate role (such as `role="region"`).


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/scroll-snap-realtime-feedback/guide.md#L63-L118). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
