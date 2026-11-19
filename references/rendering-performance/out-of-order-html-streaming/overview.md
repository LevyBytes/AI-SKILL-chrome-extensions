```yaml
---
name: out-of-order-html-streaming
description: Declaratively update a page with content streamed later into the same HTML document or via imperative JavaScript APIs.
web-feature-ids:
  - template-for
  - html-setters
  - html-streaming-setters
  - html-processing-instructions
  
---
```

# Out-of-Order (OOO) HTML Streaming

Out-of-Order (OOO) HTML Streaming (also known as Declarative Partial Updates) is an alternative to the traditional "top-to-bottom" linear processing of HTML. It allows developers to define placeholders earlier in a document and "patch" them with content that arrives later in the same network stream, or via new imperative JavaScript streaming APIs.

## Quick Overview

The feature consists of two primary mechanisms:

1. **Declarative Patching (HTML-based)**: Uses new processing instructions (`<?marker>`, `<?start>`, `<?end>`) and `<template for>` to swap content in the DOM as it streams in from the server.
2. **Imperative setting and streaming (JS-based)**: A suite of new methods (e.g., `streamHTML()`, `setHTMLUnsafe()`) that allow setting of HTML or piping readable streams directly into DOM elements with native performance and optional script execution.

## Best Practices

* **Prioritize Above-the-Fold Content**: Stream critical UI (header, hero, primary navigation, primary content) first. Use placeholders for "expensive" or lower priority components like comments, ads, or related content.
* **Implement Native Loading States**: Use the `<?start>` and `<?end>` markers to wrap fallback content. The browser automatically replaces everything between these markers when the corresponding `<template for>` arrives.
* **Minimize Cumulative Layout Shift (CLS)**: Always provide stable dimensions for placeholders. If the final content size is unknown, use skeleton screens or CSS `aspect-ratio` to reserve space and prevent jarring shifts.

## Accessibility Considerations

Be mindful that out-of-order updates can confuse screen reader users, people with cognitive impairments, and people who do not use a mouse or touch to interact with page content. In particular, make sure that focus is not lost if a placeholder containing the active element is replaced.

Additionally, and particularly when contents take a subjectively long time to stream, it may be necessary to provide text-based progress information, such as a "Loading..." notification, wrapped in a live region to prevent people from thinking that the page is "broken".

However, while it is tempting to inform them about every change to page content while it is being streamed, too many notifications can be disruptive and irritating, even when implemented with the best intentions. In particular:

* MANDATORY: Only apply the live region markup to the container for the text that indicates progress. Do not wrap the entire content in a live region, as this will cause screen readers to announce the full "patched" content when streaming is complete, which can overwhelm screen reader users.
* MANDATORY: Do not use `role="alert"` for conveying progress information. Some screen readers such as NVDA will announce the term "Alert" before announcing the live region text, which can be irritating for screen reader users, particularly when the related content doesn't represent an alert.

To decide on the best approach, be mindful of the type of content that is being streamed, and the types of components that are being populated by the streaming content.

For example, consider the following use cases.

1. **A dashboard-type user interface made up of several panels:** The content for each panel is opened in stages before the user can interact with the main content section as a whole, and - for some panels - it takes some time for some content to load, often up to a minute or more. Here, a live region-based notification is necessary. Apply the `aria-busy` attribute with a value of `true` to the container for the affected panels so that screen reader users are aware that the contents are not ready for interaction. This attribute should then be set to `false` when the streaming is complete.
   * MANDATORY: Do not nest the live region-based notification inside panels with `aria-busy="true"`, as this will prevent screen readers announcing the live region until after all of the content has been loaded.
   * MANDATORY: Focus must remain where it is while content is loading; it must not move to the content during the loading process or when loading is complete.
2. **A single page application:** An app is made up of a single HTML document. Rather than open a new page when a link is activated, the existing page content is automatically replaced with new content via streaming. Unless there is a delay due to the streaming content taking time to render, a live region-based notification is unnecessary. However, focus should move to the start of the new content when streaming is complete.
3. **A product page where content is streamed as the user scrolls the page:** When the page loads, the user is presented with a list of 10 products. As they scroll the page, additional products are added to the list via streaming. There is a short delay to allow the streaming content to load, during which time a "Loading additional products..." message is displayed and then replaced with the new content. Similarly to the first use case, this message should be wrapped in a live region, the `aria-busy` attribute should be applied to the container for the updating content (being reset to `aria-busy="false"` when the content is fully loaded), and focus should remain where it is and not move to the new content.
4. **A mega menu with a submenu whose content is rendered via streaming:** Whether the submenu content is streamed out-of-order while still collapsed or streamed almost immediately when expanded, it can be interacted with in the same way as if it weren't streamed. Here, the impact on screen reader users is negligible, so there is no need for a live region or any additional focus management.
5. **A profile widget that is added to the header after an API call is made to check the current status:** On initially loading the page, a "Login" link is displayed at the right-hand side of the header. If the user is already logged in, this is immediately replaced with a profile menu button. For such users, the change is barely noticeable. Like in the previous use case, there is no need to include a live region-based notification, nor should focus be moved to the new content.

## Implementation Details


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/out-of-order-html-streaming/guide.md#L1-L53). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
