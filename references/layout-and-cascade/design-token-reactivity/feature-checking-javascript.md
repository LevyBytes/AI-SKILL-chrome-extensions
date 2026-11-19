### Feature-checking with JavaScript

For feature-checking with JavaScript, it is slightly more complicated as the `CSSContainerRule` interface existed prior to the addition of container style queries, so it is unreliable for this purpose. Instead, you’ll need to check the computed value of a known property that is being set with a style query.

This example uses a custom property as it will have no visual effect:

```css
:root {
  --style-queries-supported: check;
}

@container style(--style-queries-supported: check) {
  body {
    --style-queries-supported: yes;
  }
}
```

Then check the computed value in JavaScript like this:

```js
if (getComputedStyle(document.body).getPropertyValue("--style-queries-supported") === "yes") {
  // Use container style queries
} else {
  // Use fallback strategy
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/css/design-token-reactivity/guide.md#L155-L182). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
