Related section: [Fallback strategies](fallback-strategies.md).
# Styling siblings based on count and index

Historically, applying unique styles to each sibling in a list required complex `:nth-child` loops or JavaScript to inject inline styles. Modern CSS provides `sibling-index()` and `sibling-count()` to perform these calculations directly in your stylesheet, enabling dynamic layouts and color systems that automatically adapt as elements are added or removed.

## Dynamic color systems

You can create a color spectrum across a group of siblings by calculating a unique hue or lightness value for each child. This ensures a consistent gradient effect regardless of the number of items.

```css
.swatch {
  /* Calculate hue by dividing the full 360deg circle by total siblings */
  /* and multiplying by the current element's 1-based index */
  background-color: hsl(
    calc(360deg / sibling-count() * sibling-index()),
    70%,
    50%
  );
}
```

## Symmetrical layout and fan effects

To create symmetrical effects (like a "fan" or centering items), use the total count to find the midpoint of the list.

```css
.card {
  /* Find the center index (e.g., 3 if there are 5 siblings) */
  --center: calc((sibling-count() + 1) / 2);

  /* Rotate items away from the center: negative for left, positive for right */
  /* center element gets 0deg rotation */
  transform: rotate(calc(10deg * (sibling-index() - var(--center))));
}
```

## Circular and complex positioning

By combining these functions with CSS trigonometry (`sin()`, `cos()`), you can place elements in a perfect circle without any manual coordinates.

```css
.orb {
  /* Calculate the angle for this item's position on a 360deg circle */
  --angle: calc(360deg / sibling-count() * sibling-index());
  --radius: 150px;

  /* Set the pre-transformed position for all items to be centered */
  position: absolute;
  place-self: center;


  /* Position each element around the parent center */
  transform: translate(
    calc(cos(var(--angle)) * var(--radius)),
    calc(sin(var(--angle)) * var(--radius))
  );
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/css/dynamic-sibling-styling.md#L1-L58). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
