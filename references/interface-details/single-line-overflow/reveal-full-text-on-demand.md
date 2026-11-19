## Reveal full text on demand

Reveal on `:hover` and `:focus-visible` of the interactive element, never on hover alone. Move the text only when `prefers-reduced-motion` is `no-preference`; otherwise leave the ellipsis.

Hover and focus reveal nothing on touch. Give the full text another route: the selected item shows it untruncated (a selected tab is never shrunk), a row opens a detail view, or the text is also shown in full elsewhere.

Choose by whether the element may grow:

1. **Scroll the text inside its box** when nothing else may move: grids, tables, tab strips, dense lists. The element keeps its size.
2. **Expand the element** when it may grow to its text, such as a chip or a tag with a `min-inline-size` and `max-inline-size`. Siblings shift to make room, so do not use it in grids or tables, where it breaks alignment.
3. **Use a tooltip** when it would add information beyond the label, or when the full text can be exceedingly long (methods 1 and 2 are less tolerant of extreme variance)

### 1. Scroll the text inside its box

Move the text by the difference between the element's width and its own: a percentage margin resolves against the element, a percentage translate against the text itself. The element's own scroll timeline flags truncation in a custom property, and a style query on it limits the motion to truncated text, so text that fits stays put. The inner `span` is the only extra markup: it becomes the box that moves. The same class works on non-interactive elements such as list items, where hover still reveals.

```html
<a class="label" href="…"><span>Meeting notes from Tuesday afternoon</span></a>
```

```css
.label {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  /* Active only while the text overflows */
  animation: truncated linear both;
  animation-timeline: scroll(self inline);
}

/* The same flag as the fade, registered there so it does not inherit */
@keyframes truncated {
  from, to {
    --truncated: 1;
  }
}

@media (prefers-reduced-motion: no-preference) {
  /* Outside the query: a container cannot query itself */
  .label:is(:hover, :focus-visible) {
    text-overflow: clip;
  }

  @container style(--truncated: 1) {
    .label:is(:hover, :focus-visible) > span {
      /* Needs its own box to be moved. It stays inline otherwise, so the ellipsis renders. */
      display: inline-block;
      /* Forward by the element's width, then back by the text's own width */
      margin-inline-start: 100%;
      /* 1px short, so the text still overflows and the timeline stays active */
      translate: calc(1px - 100%);
      /* Example values. Set only here: when the pointer leaves, the text snaps back behind the ellipsis */
      transition: margin-inline-start 2s ease-in, translate 2s ease-in;
    }

    /* The overflow is on the left, so the text moves right */
    .label:is(:hover, :focus-visible):dir(rtl) > span {
      translate: calc(100% - 1px);
    }
  }
}
```

The duration is fixed, so longer text scrolls faster. CSS cannot measure the text, so if a constant speed matters, set a `--scroll-width` custom property from script to the hidden width (`scrollWidth - clientWidth`, as a number) in the `ResizeObserver` from the detection section below, and derive the duration from it, for both the scroll and the fade:

```css
/* Example speed: 10ms per hidden pixel. Without script, assumes 200px. */
transition-duration: calc(var(--scroll-width, 200) * 10ms);
```

Use a timing function that starts slowly and accelerates, such as `ease-in`: a pointer that only passes over barely moves the text, and the end, which is what the user is waiting for, arrives quickly.

With a fade instead of an ellipsis, the text would scroll under the fade and its end would stay unreadable. Shrink the fade in step with the scroll, so it is gone when the end arrives:

```css
@media (prefers-reduced-motion: no-preference) {
  .label:is(:hover, :focus-visible) {
    --fade-size: 0px;
    /* Same duration and easing as the scroll. Set only here, so the fade is back as soon as the text snaps back. */
    transition: --fade-size 2s ease-in;
  }
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-atoms/single-line-overflow/guide.md#L164-L248). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
