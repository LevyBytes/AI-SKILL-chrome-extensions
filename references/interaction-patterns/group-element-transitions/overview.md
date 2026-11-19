Related section: [Implementation steps](implementation-steps.md).
```yaml
---
name: group-element-transitions
description: Smoothly rearrange and animate list items, cards, or grid elements into their new positions simultaneously when adding, removing, shuffling, or reordering—such as removing a product from a shopping cart.
web-feature-ids:
  - view-transitions
  - view-transition-class
---
```

# Smoothly rearrange cards, lists, and groups of elements on add, remove, or reorder

As items are added or removed from a list, or rearranged, transitions can help users maintain context. View transitions provide a way to transition between two states of an element by giving the element a unique `view-transition-name`. When multiple elements on a page share the same transition behavior, `view-transition-class` allows you to define that logic once in CSS rather than repeating it for every unique `view-transition-name`. This keeps your stylesheets maintainable while ensuring consistent animations across a group of elements.

## Implementation steps

1. **Assign unique names and a shared class**

   Each element that needs to be tracked individually during a transition must have a unique `view-transition-name`.

   ```html
   <!-- Mandatory: Each element must have a unique view-transition-name -->
   <li style="view-transition-name: item-1" class="item">Item 1</li>
   <li style="view-transition-name: item-2" class="item">Item 2</li>
   ```

   To apply shared styles, also assign a `view-transition-class`.

   ```css
   .item {
     view-transition-class: list-item;
   }
   ```

2. **Define the shared transition logic**

   Use the `::view-transition-group()` pseudo-element targeting a `view-transition-class` to apply animation styles to all members of that group.

   ```css
   /* Targets any view transition group that has the 'list-item' view-transition-class */
   ::view-transition-group(.list-item) {
     /* Duration and non-linear easing are examples; customize with any ease* keyword, cubic-bezier(), or multi-stop linear() curve */
     animation-duration: 0.5s;
     animation-timing-function: ease-in-out;
   }

   /* Handle accessibility by respecting motion preferences */
   @media (prefers-reduced-motion: reduce) {
     /* Disable all group transitions, including the default `root` group. */
     ::view-transition-group(*),
     ::view-transition-old(*),
     ::view-transition-new(*) {
       animation: none !important;
     }
   }
   ```

3. **Define entry and exit animations (when adding or removing items)**

   Use the `:only-child` selector to add specific transitions to the elements that are added or removed. `::view-transition-new()` and `::view-transition-old()` pseudo-elements are children of a `::view-transition-image-pair()` pseudo-element, so we can determine it is an added or removed element if it is the only child. Entry effects typically use a curve that eases out (such as `ease-out`) so added items decelerate into place, whereas exit effects typically use a curve that eases in (such as `ease-in`) so removed items accelerate away.

   ```css
   /* A `::view-transition-new()` element is the only child if it wasn't present before the view transition, so it is an added element. */
   ::view-transition-new(.list-item):only-child {
     animation-name: slide-in;
     /* Override the duration inherited from ::view-transition-group(.list-item) if desired (example value) */
     animation-duration: 1s;
     /* Entry effects typically ease out as the element settles into place */
     animation-timing-function: ease-out;
   }
   /* A `::view-transition-old()` element is the only child if it isn't present after the view transition, so it is a removed element. */
   ::view-transition-old(.list-item):only-child {
     animation-name: slide-out;
     /* Override the duration inherited from ::view-transition-group(.list-item) if desired (example value) */
     animation-duration: 1s;
     /* Exit effects typically ease in as the element leaves */
     animation-timing-function: ease-in;
   }

   @keyframes slide-in {
     from {
       translate: -100vw 0;
     }
   }
   @keyframes slide-out {
     to {
       translate: -100vw 0;
     }
   }
   ```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-behaviors/group-element-transitions/guide.md#L1-L89). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
