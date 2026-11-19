Related section: [Rollout Strategy](rollout-strategy.md).
# Prevent DOM-based XSS attacks with Trusted Types

Trusted Types is a security feature that helps prevent DOM-based Cross-Site Scripting (DOM XSS) by requiring that data being passed into "dangerous" browser APIs (known as sinks) is first converted into a specific type, such as `TrustedHTML`.

By default, many DOM APIs (like `innerHTML` or `document.write`) accept raw strings. If a string contains malicious script from an untrusted source, it can be executed. Trusted Types changes this behavior: once enabled via CSP, these sinks will only accept `TrustedHTML` objects created by authorized policies.

## Key Implementation Details

To use Trusted Types, follow four main steps:

1. Define a security policy that specifies how to sanitize or transform strings.
2. Use that policy to create Trusted Type objects from raw strings.
3. Use the Trusted Type objects when writing to DOM sinks.
4. Enforce Trusted Types using a Content Security Policy (CSP).

### 1. Creating a Policy

A policy is a set of rules for sanitizing content. You create it using `trustedTypes.createPolicy()`, typically delegating to a sanitizer library such as DOMPurify or your application's HTML escaping rules:

```javascript
import DOMPurify from 'dompurify';

const myPolicy = trustedTypes.createPolicy('sanitize-html', {
  createHTML: (input) =>
    // Return a sanitized string; createPolicy() wraps it in a TrustedHTML object.
    // Example using DOMPurify:
    DOMPurify.sanitize(input, { RETURN_TRUSTED_TYPE: false }),
});

// Example using HTML escaping (for environments without third-party sanitizers):
const escapePolicy = trustedTypes.createPolicy('escape-html', {
  createHTML: (input) =>
    String(input)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;'),
});
```

> [!WARNING]
> Character-level HTML escaping (`escapePolicy`) converts all markup into plain text and is **not** a context-aware HTML sanitizer. If you only need plain text, prefer `element.textContent` (which is not a Trusted Types sink). Never interpolate `escapePolicy.createHTML()` output into another HTML template string—such as an unquoted attribute (`<img src=${escaped}>`) or a URL attribute (`<a href="${escaped}">`, where `javascript:` URLs are not neutralized by entity escaping). Use a full HTML sanitizer (`DOMPurify` or `element.setHTML()`, covered in `sanitize-untrusted-html` (via `npx -y modern-web-guidance@latest retrieve "sanitize-untrusted-html"`)) whenever accepting HTML markup or attributes.

### 2. Using the Policy

Instead of passing a string directly to a sink, you call the policy's creation method.

```javascript
const untrustedInput = '<p>Hello, <strong>world</strong>!</p><img src="x" onerror="alert(1)">';

// In an enforced environment, this would throw a TypeError:
// element.innerHTML = untrustedInput;

// This returns a TrustedHTML object with unsafe elements and attributes removed:
const cleanHTML = myPolicy.createHTML(untrustedInput);
// Result: "<p>Hello, <strong>world</strong>!</p><img src=\"x\">"
```

### 3. Transitioning sinks to use Trusted Types

Update each instance where you write to a sink to first convert it to a Trusted Type object. To help locate where code needs to be updated, you can define a temporary `default` policy that logs when a sink is written to with a string rather than a TrustedType.

```javascript
trustedTypes.createPolicy("default", {
  createHTML(value) {
    console.warn("String passed instead of Trusted Type.");
    return DOMPurify.sanitize(value, { RETURN_TRUSTED_TYPE: false });
  },
});
```

Common sinks that support Trusted Types include:
- **HTML:** `element.innerHTML`, `element.outerHTML`, `document.write()`, `element.setHTMLUnsafe()`, `Document.parseHTMLUnsafe()`
- **Script:** `<script>` text content, `eval()`
- **ScriptURL:** `<script src>`, `Worker()`, `SharedWorker()`

```javascript
// Assign the TrustedHTML object.
element.innerHTML = cleanHTML;
```

Note that the "safe" HTML sanitization methods (`element.setHTML()` and `Document.parseHTML()`, covered in `sanitize-untrusted-html` (via `npx -y modern-web-guidance@latest retrieve "sanitize-untrusted-html"`)), do not require a Trusted Types policy, as they always sanitize potential XSS attacks natively.

### 4. Enforcing Trusted Types with CSP

Trusted Types should be rolled out incrementally to avoid breaking your application. While full enforcement provides the strongest protection, it carries a risk of site breakage if every sink write hasn't been migrated.

#### Prerequisites

- **Framework cooperation**: If your application's framework (or any third-party library that writes to DOM sinks) does not produce `TrustedHTML` or `TrustedScript` values, you cannot enforce Trusted Types without breaking that code. Audit framework support before starting the rollout.
- **Sink refactoring**: Ensure you have identified and refactored dangerous sinks to use your Trusted Types policies.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/security/trusted-types.md#L1-L93). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
