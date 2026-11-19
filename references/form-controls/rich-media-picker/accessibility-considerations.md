## Accessibility considerations

MANDATORY: When the select is expanded and the list of options are visible, there must be a way to visibly identify which option is selected. Examples of how this could be achieved include: using a custom icon, adding a sufficiently contrasting outline (that clearly differs from focus/hover indication), or using a sufficiently contrasting background color.

Ensure that the rich media picker always has an associated visible label that conveys the context of the information required. This will allow people to independently select the option that they need. This ensures adherence to WCAG 3.3.2 Labels or Instructions, which requires that labels or instructions are provided when content requires user input. Similarly, ensure that all of the options include visible text, and do not rely solely on an image or colour, so that people can easily select the option that they need.

Ensure that options have enough context to be understood in isolation, particularly given that browsers that don't yet support this feature will default to displaying all of the text in a single option. For example, the following rich option, would be rendered as "Frontend Developer React, Vue, CSS", in a browser that doesn't support customizable selects. Without the visual design, this can affect the meaning of the options.

```html
<!-- Rich options -->
<option value="frontend">
  <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
    <line x1="8" y1="21" x2="16" y2="21"></line>
    <line x1="12" y1="17" x2="12" y2="21"></line>
  </svg>
  <div class="option-text">
    <span class="option-title">Frontend Developer</span>
    <span class="option-desc">React, Vue, CSS</span>
  </div>
</option>
```

To address this issue, ensure that the content makes sense, regardless of visual styling, and where necessary use inclusively hidden text to ensure that content makes sense. In the previous example, we could add: `<span class="visually-hidden">Responsibilities include:</span>`, as well as a full stop, so that browsers that don't support customizable selects would provide the option text as: "Frontend Developer. Responsibilities include: React, Vue, CSS", which makes more sense. The use of a full stop can help indicate when screen readers should pause when announcing the content, helping people to better understand the structure of the option text. The updated HTML for the option would be:

```html
<!-- Rich options -->
<option value="frontend">
  <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
    <line x1="8" y1="21" x2="16" y2="21"></line>
    <line x1="12" y1="17" x2="12" y2="21"></line>
  </svg>
  <div class="option-text">
    <span class="option-title">
      Frontend Developer<span class="visually-hidden">.</span>
      <span class="visually-hidden">Responsibilities include:</span>
    </span>
    <span class="option-desc">React, Vue, CSS</span>
  </div>
</option>
```

This approach helps ensure equity in the information provided across browsers, regardless of whether the feature is supported or not.

**DON'T** override the option's text, by applying an `aria-label` on it. This will result in people missing visible text that hasn't been included in the `aria-label`. It also risks the issue arising when the option text is updated in the future. Instead, ensure that the entire option text makes sense in isolation.

**DON'T** add interactive elements or semantics inside the `<option>` element. People using screen readers will not hear the announcements, and as a result, won't be able to determine that further information is present.

## Fallback Strategies

{{ FEATURE_FALLBACKS("customizable-select") }}

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/forms/rich-media-picker/guide.md#L117-L170). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
