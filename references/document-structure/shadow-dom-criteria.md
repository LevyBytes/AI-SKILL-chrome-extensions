- The custom element attaches an open shadow root (`mode: 'open'`) to encapsulate its internal DOM subtree.
- The component defines a `<template>` once outside the constructor and builds each instance's shadow root by cloning its `.content` (`cloneNode(true)` or `document.importNode(content, true)`), without assigning `innerHTML` per instance.
- Light DOM children with `slot` attributes are projected into matching named `<slot name="...">` elements inside the shadow root, while unslotted children are projected into the default `<slot>`.
- Adding or removing a slotted Light DOM element after upgrade updates the component's state, attributes, or rendered DOM via a `slotchange` listener. Whitespace-only text does not count as content: use `assignedElements()` or filter `assignedNodes()`.
- Component styles live in the shadow root: an `adoptedStyleSheets` `CSSStyleSheet` shared across instances, a `<style>` element, or a `<link rel="stylesheet">` inside the shadow tree.
- A Light DOM element outside the component that uses the same class name as an internal element does not receive the component's styles.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/html/shadow-dom/expectations.md#L1-L6). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
