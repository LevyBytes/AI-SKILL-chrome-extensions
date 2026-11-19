```yaml
---
name: accessibility
description: Actionable coding guidelines for building accessible web applications, covering semantic HTML, focus management, forms, media, and testing. Use this skill when auditing or implementing accessibility features, keyboard navigation, or ARIA.
---
```

# Accessibility Coding Guidelines

This guide provides actionable DOs and DON'Ts for AI coding agents to ensure web applications are accessible to all users, including those using assistive technologies.

Keep these principles in mind throughout:

- **Accessibility is the minimum, not the ceiling.** Conformance to standards is the floor; aim for genuine usability.
- **Patterns are use-case specific.** No checklist replaces real testing — including testing with disabled users — to confirm a given implementation is actually accessible in context.

Contents:

- [1. Content Navigability and Structure](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#1-content-navigability-and-structure)
  - [Landmarks](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#landmarks)
  - [Headings](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#headings)
  - [Lists](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#lists)
  - [Tables](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#tables)
  - [Skip links](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#skip-links)
  - [Code example: good use of landmarks, headings, lists, tables, and a skip link](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#code-example-good-use-of-landmarks-headings-lists-tables-and-a-skip-link)
- [2. Semantic HTML and ARIA](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#2-semantic-html-and-aria)
  - [Prefer native HTML](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#prefer-native-html)
  - [ARIA roles and states](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#aria-roles-and-states)
- [3. Accessible Names and Descriptions](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#3-accessible-names-and-descriptions)
  - [Naming mechanisms](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#naming-mechanisms)
  - [Choosing the name](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#choosing-the-name)
  - [Descriptions](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#descriptions)
  - [Code Example: Visually Hidden Utility](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#code-example-visually-hidden-utility)
- [4. Document Metadata and Language](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#4-document-metadata-and-language)
  - [Language](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#language)
  - [Titles](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#titles)
  - [Iframes](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#iframes)
  - [Code Example: using the `<title>` and `<iframe>` elements](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#code-example-using-the-title-and-iframe-elements)
- [5. Keyboard and Focus Management](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#5-keyboard-and-focus-management)
  - [Tab order and focusability](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#tab-order-and-focusability)
  - [Keyboard handlers](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#keyboard-handlers)
  - [Focus indicators](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#focus-indicators)
  - [Target sizes](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#target-sizes)
- [6. Alternate Text and Media](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#6-alternate-text-and-media)
  - [Images](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#images)
  - [Inline SVGs](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#inline-svgs)
  - [Complex images and charts](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#complex-images-and-charts)
  - [Audio and video](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#audio-and-video)
  - [CSS generated content](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#css-generated-content)
  - [Content Visibility Decision Matrix](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#content-visibility-decision-matrix)
- [7. Forms and Input Controls](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#7-forms-and-input-controls)
  - [Labels and hints](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#labels-and-hints)
  - [Input assistance and validation](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#input-assistance-and-validation)
- [8. Live Regions](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#8-live-regions)
  - [Live Region Urgency Table](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#live-region-urgency-table)
  - [When to announce](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#when-to-announce-live-regions)
  - [Managing announcements](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#managing-announcements)
- [9. Color](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#9-color)
- [10. Typography](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#10-typography)
- [11. Motion and Preferences](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#11-motion-and-preferences)
- [12. Modals and Native Dialogs](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#12-modals-and-native-dialogs)
  - [Native `<dialog>`](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#native-dialog)
  - [Custom overlays](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#custom-overlays)
- [13. Testing Validations](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#13-testing-validations)
  - [Automated checks](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#automated-checks)
  - [Manual testing](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#manual-testing)

## 1. Content Navigability and Structure

### Landmarks

- **Place all content within landmarks:** Wrap each relevant part of the page in `<header>`, `<nav>`, `<main>`, `<aside>`, and `<footer>` elements so assistive-tech users can jump between regions. (1.3.6 Identify Purpose (Level AAA))
- **Use the correct landmark:** Use the `<header>` element as a container for introductory content, the `<nav>` element as a container for site-wide or in-page navigation links, the `<main>` element as a container for the main content of the page, the `<aside>` element as a container for content that is tangentially related to the main content, and the `<footer>` element as a container for information about the related content, such as the author, copyright information, and links to related documents. (1.3.1 Info and Relationships (Level A))
- **Use one `<main>` landmark per page:** Avoid using multiple `<main>` elements on a single page. (1.3.1 Info and Relationships (Level A))
- **Provide distinguishable accessible names for navigation regions:** If a page contains multiple `<nav>` elements, apply the `aria-label` attribute to each element and set its value to a distinguishable accessible name for the region. For example: `<nav aria-label="Primary">`, `<nav aria-label="Secondary">`, and so on. (Best practice)
- **Don't overuse landmarks:** Too many landmarks dilute their value. In particular, avoid labeling a `<section>` (which turns it into a `region` landmark) — `region` should be a last resort when no other landmark fits. (Best practice)

### Headings

- **Structure main content with headings:** Use `<h1>`–`<h6>` elements sequentially so screen reader users get a navigable outline. (1.3.1 Info and Relationships (Level A))
- **Mandatory - Don't use "fake" headings:** Never use `<div>` or `<span>` elements to look like headings without standard `<h1>`–`<h6>` elements. (1.3.1 Info and Relationships (Level A))
- **Avoid nesting headings incorrectly:** Make sure that, if a sub-heading is visually less important than its parent heading, its heading level is lower in the heading hierarchy. (1.3.1 Info and Relationships (Level A))
- **Use one `<h1>` element per page:** Use the `<h1>` element for the page's main heading. Having more than one `<h1>` element on a page makes it difficult for screen reader users to identify the actual main heading. (Best Practice)
  - **Caveat:** If a page includes a modal dialog that is marked up using the `<dialog>` element, `role="dialog"`, or `role="alertdialog"`, it is fine to mark up its main heading using the `<h1>` element because the dialog is a new window that is separate from the page.
- **Avoid "skipped" heading levels:** Avoid jumping directly from (for example) `<h1>` → `<h4>` to avoid breaking the logical hierarchy. (Best Practice)
- **Avoid placing headings inside the `<summary>` element:** Some browsers still expose this element as a button, which removes all roles from its children including headings. If a heading must act as a disclosure trigger, use an accordion or a disclosure implemented with ARIA where the heading element wraps the button, rather than use the `<details>` and `<summary>` elements. (Best Practice)

### Lists

- **Use lists for repeated, contiguous content:** `<ul>`/`<ol>` give assistive tech a count of listitems up front and let users skip the entire list. (1.3.1 Info and Relationships (Level A))
- **Use the correct list element:** Use the `<ul>` element for unordered lists where the order of the items is **not** important (such as a list of related products), and use the `<ol>` element for ordered lists where the order of the content **is** important (such as a list of instructions). (1.3.1 Info and Relationships (Level A))
- **Don't use lists for non-list content:** Do not use list markup to mark up separate paragraphs of text, as screen readers will announce list information when they encounter lists, therefore leading to a screen reader hearing potentially confusing and redundant information about the related content. (1.3.1 Info and Relationships (Level A))
- **Don't use lists for checkboxes and radio buttons:** When marked up correctly, screen readers will already announce the number of checkboxes or radio buttons, as well as the number of the currently focused checkbox / radio button in the set, even though there is no list markup. Additional list markup will lead to duplication. (1.3.1 Info and Relationships (Level A))


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#L1-L92). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
