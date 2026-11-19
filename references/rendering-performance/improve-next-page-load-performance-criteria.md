# Expectations: `improve-next-page-load-performance`

- The rule is included in a `<script type="speculationrules"></script>` tag.
- The rule is valid JSON.
- The rule contains one or more of the following top-level keys:
  - `"prefetch"`
  - `"prerender"`
  - `"prerender_until_script"`
  - `"tag"`
- Use of the `tag` property is encouraged to allow for easier identification of rules.
- The rule contains either `urls` or `where` property,
- The `urls` property is an array of URL strings.
- The `where` property is a JSON object that contains one or more of the following keys:
  - `"href_matches"`
  - `"selector_matches"`
  - `"not"`
  - `"and"`
  - `"or"`
- The optional `eagerness` property is one of the following:
  - `"immediate"`
  - `"eager"`
  - `"moderate"`
  - `"conservative"`
- If using `immediate` for `urls` property then the `urls` property should contain a maximum of 10 urls, and ideally fewer.
- If using `immediate` for `where` property then the rule should be very specific and match a maximum of 10 urls, and ideally fewer.
- The `source` property is no-longer needed and discouraged so should not be present in the rule.
- Do not speculate URLs that likely trigger state changes (e.g., `/logout`).
- The page should be a Multi-Page Application (MPA), not a Single Page Application (SPA).

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/improve-next-page-load-performance/expectations.md#L1-L28). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
