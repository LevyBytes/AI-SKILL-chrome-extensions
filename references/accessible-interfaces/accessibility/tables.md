### Tables

- **Do use the correct table elements:** Use the `<table>` element to identify the table, the `<caption>` element to provide a title and accessible name for the description, the `<tr>` element to identify individual rows in the table, and the `<th>` and `<td>` elements to identify header and data cells respectively. (1.3.1 Info and Relationships (Level A))
- **Do use the `scope` attribute on `<th>` elements:** The `scope` attribute indicates whether the `<th>` element represents a row header (`<th scope="row">`) or a column header (`<th scope="col">`). (1.3.1 Info and Relationships (Level A))
- **Mandatory - Don't use tables for layout:** Screen readers will announce redundant information about the layout, which may be confusing for screen reader users, while the use of tabular markup has an impact on the reading and keyboard focus order of content. Use CSS Grid/Flexbox for visual layouts instead. (1.3.1 Info and Relationships (Level A))
- **Avoid overly-complex tables:** Spanned rows, spanned columns, nested tables, and expandable / collapsible rows can make sense visually and meet the related WCAG success criterion, but the overall structure can be disorienting and difficult to navigate for screen reader users. In such cases, break tables up into smaller tables that are easier and more efficient to navigate. (Best Practice)

### Skip links

- **Provide skip links** prior to repeated content like site headers with navigation or long/infinite lists, so that keyboard users can easily bypass them. (2.4.1 Bypass Blocks (Level A))
  - **Caveat:** Sometimes screen magnifiers do not follow the focus when a skip link’s target is not normally focusable.
    The recommended workaround is to make the target programmatically focusable, but not a part of the tab order, using `tabindex="-1"`.
    If the target contains focusable elements, this creates another usability issue as clicking within the target will always set the **sequential focus navigation start point** to the target rather than at a point between focusable elements.
    A solution that satisfies both user expectations is to make the first meaningful element within the intended target the actual target of the skip link with `tabindex="-1"`, for example a heading (`<h1 id="content" tabindex="-1">`).
    Beware that any content prior to such an element will be skipped, including other relevant content within the targeted section, and this creates usability gaps for other assistive tech users.
- **Avoid using skip links where they are not needed:** A set of pages whose only common element is a single link to the Home page does not need a skip link. (Best Practice)
- **Avoid overusing skip links:** A single skip link, or two skip links to cover the primary and secondary sets of common navigation links, is usually sufficient on a single page. Multiple unnecessary skip links add to the number of <kbd>Tab</kbd> stops to a page, which causes frustration for people who use the keyboard alone for navigation. (Best Practice)

```html
<!-- Good: Skip to main content -->
<a href="#content" class="skip-link">Skip to main content</a>
<main id="content">...</main>
```

### Code Example: good use of landmarks, headings, lists, tables, and a skip link

```html
<!-- Good: Semantic landmarks, heading hierarchy, skip link -->
<header>
  <a href="#platform-dashboard" class="skip-link visually-hidden">Skip to content</a>
  <nav aria-label="Primary">
    <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </nav>
</header>
<main>
  <h1 id="platform-dashboard" tabindex="-1">Platform Dashboard</h1>
  <section>
    <h2>User Statistics</h2>
    <table>
      <caption>Monthly active users</caption>
      <thead>
        <tr>
          <th scope="col">Month</th>
          <th scope="col">Users</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>January</td>
          <td>12,000</td>
        </tr>
      </tbody>
    </table>
    <h3>Notes</h3>
    <ul>
      <li>Results do not include users without active subscriptions</li>
      <li>Results are accurate as of 31 December 2025</li>
    </ul>
  </section>
</main>
```

## 2. Semantic HTML and ARIA

### Prefer native HTML

- **Prefer HTML elements and attributes to ARIA:** Avoid `<div role="button">` or `<a role="button">` and use `<button>` instead. Native HTML elements and attributes already have the correct role and behavior, including keyboard support, built-in by default. `<button>` already implies `role="button"`, `required` already implies `aria-required`, and no additional JavaScript is required to ensure the correct role and behavior is supported. (Best Practice)
  - **Caveat:** ARIA is required when the related feature is not available in HTML, for example there are no HTML elements explicitly intended for building a tabbed navigation widget, but ARIA includes appropriate role and state properties for this purpose.
- **Don't add redundant ARIA roles or properties:** Avoid `<ul role="list">`, `<nav role="navigation">`, and `<input required aria-required="true">`. (Best Practice)
  - **Caveat:** Safari removes list semantics from `<ul>`/`<ol>` outside `<nav>` when `list-style: none` or `display: flex`/`grid` is applied. In that case `role="list"` is required to restore them.
- **Don't apply interactive ARIA roles to structural HTML elements:** Use `<li><span role="button">Button in a list</span></li>`, not `<li role="button">Button in a list</li>`, to avoid breaking the container list semantics. (4.1.2 Name, Role, Value (Level A))
  - **Caveat:** It is acceptable to apply ARIA roles to structural HTML elements that have similar semantics, for example a tree view: `<ul role="tree"><li role="treeitem">…</li>…</ul>`.

### ARIA roles and states

- **Match ARIA implementations to actual behavior:** When applying `role="tab"` to an element, it must then behave like a tab — including keyboard interactions. Many ARIA patterns can't be implemented in CSS alone and need JavaScript. (4.1.2 Name, Role, Value (Level A))
- **Manage toggle states:** Utilize `aria-expanded` and `aria-pressed` to communicate toggle states for custom controls. (4.1.2 Name, Role, Value (Level A))
- **Be deliberate about `disabled` vs `aria-disabled`:** `disabled` removes the element from the focus order entirely (and `tabindex="0"` won't bring it back), which is often wrong for toolbar buttons or links. `aria-disabled="true"` keeps the element focusable so users can land on it and learn it's disabled, but because it only communicates state to assistive technologies, you must also prevent activation (such as pointer clicks and keyboard triggers) in JavaScript. (4.1.2 Name, Role, Value (Level A))
- **Mandatory - Don't hide interactive elements from screen readers:** Do not apply `aria-hidden="true"` to interactive elements that receive focus, or to their parent elements. (4.1.2 Name, Role, Value (Level A))
- **Mandatory - Don't suppress the roles of interactive elements:** Applying `role="presentation"` or `role="none"` to an interactive element strips its semantics. The element will still be exposed to assistive technologies and announced by screen readers, but its role and any state information will not be, which results in confusion and potentially unexpected behavior. (4.1.2 Name, Role, Value (Level A))
- **Don't assume custom elements have no ARIA:** Custom elements can attach ARIA via `ElementInternals`, which some automated test tools can't see — so the absence of `role`/`aria-*` attributes in markup doesn't prove the element has no semantics. Verify with the browser's accessibility-tree inspector. (Best Practice)

## 3. Accessible Names and Descriptions

Every interactive element and some landmarks need an accessible name, and many benefit from an accessible description. Names are short and identify the element; descriptions add context.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#L93-L180). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
