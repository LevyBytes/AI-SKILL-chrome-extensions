Related section: [Atrule support conditionals](overview.md).
### Registered custom properties (`@property`) { #supports-atproperty }

In some cases, if the conditional CSS to apply can be reduced to a single property, you can use a dedicated custom property registered for this purpose:

```css
/* Use a custom property to conditionally include the dash animation */
@property --progress-dash-animation {
  syntax: "*";
  inherits: false;
  initial-value: , progress-dash 3s ease-in-out infinite;
}

.spinner {
  /* The dash animation is only included if @property is supported */
  animation:
    progress-spin var(--_used-spinner-duration) linear infinite
    var(--progress-dash-animation, );
}
```


For a more general-purpose solution, you can register a non-inheriting property and set it to ` ` (a space) on the root element:

{# Testcase: https://codepen.io/leaverou/pen/KwWzpVr #}

```css
@property --supports-atproperty {
	syntax: "*";
	inherits: false;
}

:root {
	--supports-atproperty: ;
}

body {
  /* The background is only applied if @property is supported */
	background: var(--supports-atproperty, green);
}
```

Notes:
- Both of these only work if whitespace is an acceptable alternative. For other cases, you will need to use JS as described below.
- The general-purpose solution depends on non-inheritance, so it will not work for declarations on the root element.

### Using JavaScript as a last resort

For entire at-rules, check for the presence of certain interfaces in JavaScript.
For example, if `globalThis.CSSFunctionRule` is defined, then `@function` is supported.

If you need to test more deeply (e.g. for certain preludes, nested rules, descriptors), you can set up a test and check how it was parsed:

```js
const sheet = new CSSStyleSheet();
sheet.replaceSync(`
  @page {
    @top-left {
      content: "test";
    }
  }
`);
const SUPPORTS_PAGE_MARGINS = Boolean(sheet.cssRules[0]?.cssRules?.[0]);
```

IMPORTANT:
- When using JS to detect support for CSS features, do NOT apply the styles from JS directly. Instead, apply a class to the root element and branch off that in CSS.
- Do note that container queries are parsed even if the prelude is not recognized, and there is no way to detect support for certain types of container queries from the CSSOM structure.
- Do NOT use `CSS.registerProperty` to detect support for `@property` as its support is slightly broader.

## Fallback strategies

{{ BASELINE_STATUS("supports-at-rule") }}

Unless this is within your support target, **ONLY** use `@supports (at-rule())` to detect at-rules for which support is narrower than the `@supports (at-rule())` feature itself.

To conditionally apply CSS based on support for at-rules that shipped before this feature, use [the guidance in the section above](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/css/atrule-support-conditionals/guide.md#detecting-at-rules-without-supports-at-rule).

To detect support for the `@supports at-rule()` feature _itself_, you can use an at-rule that is guaranteed to exist in all browsers that support `@supports at-rule()`, such as `@supports at-rule(@media) { ... }`.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/css/atrule-support-conditionals/guide.md#L76-L153). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
