### 2. Expand the element

Let the element grow to its text, and transition the growth. Set `interpolate-size: allow-keywords` so the transition can interpolate to `max-content`.

```css
.chip {
  /* Example values */
  min-inline-size: 6rem;
  max-inline-size: 12rem;
  interpolate-size: allow-keywords;

  & > span {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &:is(:hover, :focus-visible) {
    max-inline-size: var(--expanded-max-inline-size, max-content);
  }

  @media (prefers-reduced-motion: no-preference) {
    transition: max-inline-size .3s;
  }
}
```

### 3. Use a tooltip

A tooltip is exposed as the element's description, while the label stays its name.
If the tooltip only repeats the label, hide it from assistive technology (`aria-hidden="true"`), or screen readers announce the text twice.
If it adds information, leave it exposed: name and description are announced as different things. If it also repeats the label, hide that part of the tooltip (`aria-hidden="true"` on it), so the description holds only the addition.
DO NOT rely on `title` alone: it is unreachable from the keyboard and on touch.
See `interest-triggered-tooltips` (via `npx -y modern-web-guidance@latest retrieve "interest-triggered-tooltips"`) for tooltips.

## Detecting whether the text is truncated

No property reports truncation. Derive it from overflow: the element is truncated when it can scroll toward its inline end. `text-overflow` only changes painting, so this holds with an ellipsis too.

- **In CSS**, use a scroll-driven animation on the element's own inline scroll timeline, as in the fade above: it is active only while the text overflows. Declarations in the keyframes apply to the element itself. For descendants and pseudo-elements, set a custom property in the keyframes and read it with a style query. For example, to hint that hovering reveals more:

  ```css
  /* Registered so the flag does not inherit into nested truncated elements */
  @property --truncated {
    syntax: "<integer>";
    inherits: false;
    initial-value: 0;
  }

  .label {
    animation: truncated linear both;
    animation-timeline: scroll(self inline);
  }

  @keyframes truncated {
    from, to {
      --truncated: 1;
    }
  }

  @container style(--truncated: 1) {
    .label > span {
      text-decoration: underline dotted;
    }
  }
  ```

  The element's `animation` carries the detection: add any other animation to that list, since declaring `animation` again replaces it.
  DO NOT use a scroll-state query (`scrollable`) for this: the spec excludes `overflow: hidden` containers, so a browser that matches today may stop.

- **In script**, when the result drives something CSS cannot (adding a tooltip, setting an attribute), compare `scrollWidth` to `clientWidth` in a `ResizeObserver`. Run the check again when the text changes: `ResizeObserver` reacts only to size changes.

  ```js
  const observer = new ResizeObserver(entries => {
    for (const { target } of entries) {
      target.classList.toggle('truncated', target.scrollWidth > target.clientWidth);
    }
  });
  observer.observe(label);
  ```

## Fallback strategies


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-atoms/single-line-overflow.md#L230-L313). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
