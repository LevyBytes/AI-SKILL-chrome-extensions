### Tab order and focusability

- **Provide a logical tab order:** Make sure that the order in which elements receive focus follows an appropriate sequence. (2.4.3 Focus Order (Level A))
  - **Caveat:** In left-to-right reading languages, the tab order is logical when focus moves from top-to-bottom and left-to-right. However, in right-to-left reading languages, the tab order is logical when focus moves from top-to-bottom and right-to-left.
- **Use `tabindex` only when necessary:** Apply `tabindex="0"` to elements requiring focus where an appropriate interactive role has been applied but the element isn't focusable by default; for example, `<span role="button" tabindex="0">Print</span>` (2.4.3 Focus Order (Level A))
- **Manage focus correctly to and from updated content:** For example, if a dialog box appears on the page, make sure that focus immediately moves to the dialog box, is restricted to the contents of the dialog box, and (when dismissed) returns to the element that originally triggered the dialog box. (2.4.3 Focus Order (Level A))
- **Don't apply `tabindex="0"` to interactive elements that are already focusable by default:** Native elements like the `<button>`, `<a>` (only with the associated `href` attribute), and `<input>` elements are already keyboard focusable, and therefore do not require `tabindex="0"`. (2.4.3 Focus Order (Level A))
- **Don't apply `tabindex="0"` to static, non-interactive, and hidden elements:** Only elements that (when activated) perform a specific action should be included in a page's tab order. Static, non-interactive, and hidden elements (whether hidden temporarily or permanently) must not be focusable. (2.4.3 Focus Order (Level A))
- **Mandatory - Don't use positive `tabindex` values:** Never apply `tabindex="1"` (or any value > 0) to elements, as doing so imposes a tab order on the page that bears no resemblance to the intended or expected tab order. (2.4.3 Focus Order (Level A))

### Keyboard handlers

- **Attach <kbd>Enter</kbd>/<kbd>Space</kbd> handlers for custom simulated interactive elements:** When implementing a custom keyboard handler for button-like elements, <kbd>Enter</kbd> should be a `keydown` handler and <kbd>Space</kbd> should be a `keyup` handler (matching native `<button>` behavior where <kbd>Enter</kbd> repeats and <kbd>Space</kbd> triggers on release). (2.1.1 Keyboard (Level A))
- **Don't attach keyboard handlers to native interactive elements:** Native elements such as the `<button>`, `<input>`, and `<a>` (with the required `href` attribute) elements already support the <kbd>Enter</kbd> and (except for the `<a>` element) the <kbd>Space</kbd> keys by default, so adding these keyboard handlers is redundant. (Best Practice)
  - **Caveat:** if the `<a>` element is repurposed as a button through the inclusion of `role="button"`, a `keyup` handler is still required to support the <kbd>Space</kbd> key to match native `<button>` behavior.

#### Code Example: Keyboard handlers

```javascript
// Good: Keyboard handlers for complex custom widgets (e.g., Tree items, tabs).
// NOTE: This pattern applies ONLY to non-standard UI where no native HTML tag exists.
// Always prioritize native <button> or <input> elements for standard interactions.
// Elements MUST have the appropriate ARIA role (e.g., role="treeitem" or role="tab").
customWidget.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    toggleWidgetState();
  }
  if (e.key === ' ') {
    e.preventDefault(); // Prevent page scrolling on Spacebar keydown
  }
});

customWidget.addEventListener('keyup', (e) => {
  if (e.key === ' ') {
    toggleWidgetState();
  }
});

function toggleWidgetState() {
  // E.g., Manage toggle/expanded states for custom controls
  const isExpanded = customWidget.getAttribute('aria-expanded') === 'true';
  customWidget.setAttribute('aria-expanded', !isExpanded);
}
```

### Focus indicators

- **Use `:focus-visible` when styling focus indicators:** When defining custom focus indicators, always style the `:focus-visible` state (not `:focus`) explicitly. (Best Practice)
- **Prefer browser native focus indicators over custom focus indicators:** Leave focus indication to the browser unless custom focus styling is needed to meet contrast or design requirements. (Best Practice)
- **Mandatory - Don't disable browser native focus indicators without providing a replacement custom focus indicator:** When using `outline: none;` to suppress the browser native focus indicator, provide an equivalent custom focus indicator that has a contrast ratio of at least `3:1` against adjacent content (2.4.7 Focus Visible (Level AA), 1.4.11 Non-text Contrast (Level AA)).
- **Prefer `outline` over other properties for focus rings:** If `box-shadow` must be relied on for focus rings, provide an `outline`-based fallback for High Contrast Mode using the `forced-colors` media query. (Best Practice)
- **Pair custom focus outlines with `outline-offset`:** This visually separates the ring from the element. (Best Practice)

#### Code Example: Custom focus indication

```css
/* Good: High contrast focus border */
:where(a:any-link, button):focus-visible {
  outline: 3px solid #ff0055;
  outline-offset: 3px;
}
```

### Target sizes

- **Do size interactive elements to have a target of at least 24x24 CSS pixels:** Enforce the target size of elements using `min-block-size` / `min-inline-size` or through padding rather than `width` / `height` so that content grows the target but not shrink it. (2.5.8 Target Size (Minimum) (Level AA))
  - **Caveat:** Interactive elements _may_ have a target of less than 24x24 CSS pixels _as long as_ they are positioned in such a way that if a 24 CSS pixel diameter circle is centered on the bounding box of each element, the circles do not intersect nearby targets or circles for other targets that are less than 24x24 CSS pixels.
- **Bump targets up on coarse pointers:** `@media (pointer: coarse) { … }`. (2.5.8 Target Size (Minimum) (Level AA))
- **Don't use `touch-action: none;` for custom gestures:** This disables page scrolling through the element. Scope to the axis you actually need - `pan-y` for horizontal swipes (the page still scrolls vertically), and `pan-x` for vertical swipes. Reserve `none` for elements where no native touch behavior makes sense, such as a drawing canvas. (2.1.1 Keyboard (Level A))

## 6. Alternate Text and Media

### Images

- **Mandatory - Apply the `alt` attribute to all `<img>` elements:** browsers replace the image with the value of this attribute for people who use screen readers. (1.1.1 Non-text Content (Level A))
- **Do provide informative visual descriptions:** Describe the purpose of the image (for example, "Search", not "Magnifying glass"). (1.1.1 Non-text Content (Level A))
- **Do apply `alt=""` to decorative visuals:** This prevents screen readers from announcing them. (1.1.1 Non-text Content (Level A))
- **Don't use clichéd prefixes:** Avoid terms like "Image of…" and "Picture of…". (Best Practice)
- **Don't use underscores in filenames:** Use dashes if the filename might be announced as fallback. (Best Practice)

#### Code Example: Providing a text description for `<img>` elements

```html
<!-- Decorative -->
<img src="divider.png" alt="">

<!-- Informative (Functional) -->
<a href="/search">
  <img src="glass.png" alt="Search the platform">
</a>
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/accessibility/accessibility.md#L281-L372). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
