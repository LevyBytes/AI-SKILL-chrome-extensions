- The implementation MUST use `@container style()` queries to respond to changes in custom property values.
- The implementation MUST define the queried custom property on an ancestor element of the element being styled.
- The implementation MUST NOT use JavaScript for applying the styles that react to custom property changes.
- The implementation MUST NOT attempt to style the container element using its own style query.
- The implementation MUST use custom properties (CSS variables) when querying styles with `@container style()`.
- The implementation SHOULD use a style query to feature-check for container style query support when conditionally displaying UI that relies on it.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/css/design-token-reactivity/expectations.md#L1-L6). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
