Related section: [Fallbacks & browser support for Sanitizer API](fallbacks-browser-support-sanitizer-api.md).
```yaml
---
name: sanitize-untrusted-html
description: Safely parse and display untrusted HTML content from user input by removing unsafe elements and attributes.
web-feature-ids:
  - sanitizer
---
```

# Sanitizing Untrusted HTML

Safely displaying user-generated HTML is a common security challenge. The native **Sanitizer API** provides a built-in, browser-optimized way to strip dangerous content (like `<script>` tags or `on*` attributes) before it reaches the DOM.

Client-side sanitization protects the page that renders the content. If the same user-generated content is also rendered elsewhere (other clients, server-rendered pages, or emails), sanitize it on the server as well as defence in depth, and make sure the server and client sanitization rules do not conflict.

## 1. Safely Inserting HTML with `setHTML()`

The primary way to use the Sanitizer API is through the `setHTML()` method on any `Element`. This method handles parsing, sanitization and insertion in a single step, ensuring that content is sanitized specifically for the context in which it will be inserted.

```javascript
const untrustedHTML = `
  <p>Hello!</p>
  <script>alert('XSS')</script>
  <img src="x" onerror="alert('XSS')">
  <div onclick="doBadThing()">Click me</div>
`;

const container = document.getElementById('output');

// Sanitize and insert in one call
// The default sanitizer removes scripts and event handlers, plus other
// elements and attributes outside its built-in allowlist (such as style)
container.setHTML(untrustedHTML);
```

## 2. Using Custom Sanitizer Configurations

You can customize the sanitization rules by creating a `Sanitizer` instance. This allows you to define exactly which elements and attributes are permitted for your specific use case.

When using `Element.setHTML()` and `Document.parseHTML()`, the default `Sanitizer` settings remove all XSS-unsafe elements and attributes. You cannot make a more permissive `Sanitizer` that allows those elements, but you can further restrict what is allowed.

```javascript
// Define a restrictive configuration that only allows the specified elements and attributes.
const config = {
  elements: ["p", "b", "i", "strong", "em"],
  attributes: ["class"],
  replaceWithChildrenElements: ['div']
};

const mySanitizer = new Sanitizer(config);

// Apply custom sanitization
container.setHTML(untrustedHTML, { sanitizer: mySanitizer });
```

Elements that are not in `elements` are removed **together with their content**. List wrapper elements whose text you want to keep (such as `div` above) in `replaceWithChildrenElements`, which removes the element but keeps its children.

If you need a more permissive `Sanitizer` that allows some XSS-unsafe elements or attributes, you can use a custom Sanitizer with `Element.setHTMLUnsafe()` and `Document.parseHTMLUnsafe()`.

## 3. Parsing User Input with `Document.parseHTML()`

If you need to parse untrusted HTML without immediately inserting it into the live DOM, use `Document.parseHTML()`. This method returns a `Document` that has been sanitized according to default or custom rules, so you can inspect or transform the sanitized nodes (for example, to build a preview or extract text) before inserting them.

Move the resulting nodes into the page rather than serializing them to a string and re-parsing it with `innerHTML`, which can reintroduce mutation XSS (mXSS).

```javascript
const rawHTML = '<p>Hello <script>console.log("bad")</script></p>';

const doc = Document.parseHTML(rawHTML);
// doc.body now contains the sanitized nodes: <p>Hello </p>
preview.replaceChildren(...doc.body.childNodes);
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/sanitize-untrusted-html/guide.md#L1-L71). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
