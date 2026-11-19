Related section: [Registered custom properties (@property)](registered-custom-properties-property.md).
# Conditionally Apply CSS Based on At-Rule Support

Use `@supports at-rule(@<at-rule name>) {…}` to conditionally apply certain CSS rules or declarations only if a certain at-rule is supported by the browser.
This can contain entire rules, or be used in conjunction with CSS nesting to conditionally apply certain declarations.

```css
.foo {
  background: var(--accent-color);

  @supports at-rule(@property) {
    background-image: var(--rainbow-gradient);
    animation: sliding-rainbow 1s linear infinite;
  }
}
```

Do NOT use `@supports at-rule()` to conditionally apply the at-rule being detected and nothing else.

```css
/* BAD: CSS already ignores rules the browser doesn't understand, so this is unnecessary */
@supports at-rule(@starting-style) {
  @starting-style {
    /* ... */
  }
}
```

## Detecting support for at-rules when `@supports at-rule()` isn’t appropriate { #detecting-at-rules-without-supports-at-rule }

When `at-rule()` is not an option, either due to browser support or because deeper detection is needed, you can use the guidance below.

### Try properties, values, or selectors first

`@supports` can already detect properties, values, and selectors (via `@supports selector(...)`).
In many cases, you can use these to detect support for a feature without needing to check for the at-rule itself.

For example, instead of `@supports at-rule(@function)` to detect supports for custom functions, you can use `@supports (color: --foo())`.

In other cases there may be pseudo-classes or pseudo-elements that are only available when a certain at-rule is supported, which can be used to detect support.

### Detecting container query types { #supports-container-types }

`at-rule()` ONLY allows detection of at-rules by **name**.
It does NOT allow detection of other syntax or descriptors.
E.g. this will not work:

```css
@supports at-rule(@container style(--a: 1)) {
  /* ... */
}
```

For many types of container queries, you can use `container-type` with a suitable value.
E.g. `@supports (container-type: scroll-state)` for scroll-state queries, `@supports (container-type: size)` for size queries, or `@supports (container-type: anchored)` for `anchored()` queries.

However, there is no `container-type` for style queries.
IMPORTANT: Do NOT try `@supports (container-type: style)` to detect support for style queries, as this will not work.

Instead, you can try a style query that is always true:

```css
@container style(--a: 1) or (not (style(--a: 1))) {
  /* Rules here will only be applied if style queries are supported */
}
```

This will match in any browser that supports style queries, regardless of what property name or value you use, provided they are the same across both.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/css/atrule-support-conditionals.md#L1-L68). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
