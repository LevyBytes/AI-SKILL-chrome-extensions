# Scoped Component Transitions

Starting a view transition with `document.startViewTransition()` attaches the `::view-transition` overlay to the `:root` element, which blocks pointer events on the rest of the page, prevents concurrent transitions, and obscures `position: fixed` headers or open `[popover]` elements (even when nested view transition groups are used to prevent overflow bleeding).

Calling `element.startViewTransition()` on a component root addresses this by scoping the transition to that DOM subtree: the `::view-transition` pseudo-element tree is injected directly onto the element, preserving external stacking contexts and page interactivity while allowing multiple components to transition concurrently.

## Implementation

### 1. Trigger a Scoped Transition

Call `element.startViewTransition()` on the component's root container element instead of `document.startViewTransition()`. The element you call `startViewTransition()` on becomes the transition's scope (the scope element): only elements within its subtree are captured, only rendering of the scope halts during the update callback, and the resulting `::view-transition` overlay matches the scope element's size, shape, and stacking context.

### 2. Name Participating Elements

Assign a `view-transition-name` to child elements inside the scope that should animate. You can use `view-transition-name: match-element` on dynamic list items to automatically derive each element's transition name from its DOM node identity, or assign explicit names (which only need to be unique within that scope).

Names are isolated within each scope, preventing collisions across components in different parts of the DOM. However, `view-transition-name`s can collide with names in nested scoped view transitions. To prevent this, add `view-transition-scope: all` to the child scope element.

### 3. Self-Participation and Overflow Clipping

The scope element automatically participates in its own view transition because the user-agent stylesheet applies `view-transition-name: root` and `view-transition-group: contain` to it. This way, when the scope’s geometry is affected by the change you make in the DOM, it smoothly animates its own geometry alongside its children, as part of the View Transition.

When the scope clips its overflow (`overflow: hidden`, `scroll`, or `clip`), `::view-transition-group-children(root)` automatically applies `overflow: clip`, preventing transitioning children from bleeding outside the component bounds.

> [!NOTE]
> Automatic overflow clipping only applies to the scope element itself (`root`). If a captured element inside the scope clips its own overflow and contains other nested captured elements (for example, a scrollable or clipped `<ul>` inside a `.card`), use Nested View Transition Groups so those nested elements stay clipped to their outer captured container:
>
> ```css
> .card ul {
>   height: 200px;
>   overflow-y: auto;
>   view-transition-name: match-element;
>   view-transition-group: contain;
>   view-transition-class: list;
> }
>
> ::view-transition-group-children(.list) {
>   overflow: clip;
> }
> ```

### 4. Concurrent and Nested Transitions

Separate component subtrees can run `element.startViewTransition()` concurrently without skipping each other. Active scopes automatically receive `view-transition-scope: all` in the UA stylesheet so internal `view-transition-name` values do not leak into outer transitions. Apply `view-transition-scope: all` in CSS on repeated component containers to prevent outer transitions from capturing internal names even when the component is idle.

If an outer transition needs to move a component while its inner transition is active, assign a `view-transition-name` to an element wrapping the inner scope. The outer transition then captures and animates only the wrapper instead of the inner scope element, allowing the inner transition to run to completion.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-behaviors/scoped-component-transitions.md#L1-L47). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
