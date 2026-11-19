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

### Naming mechanisms

- **Prefer native naming mechanisms:** `<label>` for form controls, `<caption>` for `<table>`, `<legend>` for `<fieldset>`, `<figcaption>` for `<figure>`. (Best Practice)
- **Explicitly associate `<label>` with its control via `for`/`id`:** As well as ensuring the control is appropriately labeled by the contents of the `<label>` element, this results in a larger target area for people to activate the label _or_ its related control to move focus to the control, which isn't globally supported with other forms of labeling (such as using the `aria-labelledby` attribute). Additionally, some assistive technologies, particularly voice recognition software, require the `for`/`id` relationship to be explicitly set, even if an equivalent accessibility-supported approach (such as nesting an `<input>` inside a `<label>`) is taken. (4.1.2 Name, Role, Value (Level A))
- **Prefer `aria-labelledby` over `aria-label` when a visible label exists:** This avoids duplication, improves maintainability, and translates better. (Best Practice)
- **Don't use `title` as a naming mechanism:** The value of this attribute is only displayed on mouse hover, and cannot be displayed or otherwise accessed using the keyboard in any browser. (Best Practice)
  - **Caveat:** `<iframe>` is an exception, as the `title` attribute is the standard way of providing an accessible name for this element.
- **Don't use `placeholder` as a naming mechanism:** While the value of this attribute is initially displayed inside an `<input>` or `<textarea>`, it disappears as soon as the user enters text into the field, meaning that there is no longer a visual cue as to what the field represents. The contrast between `placeholder` text and its background in most browsers is very low, and therefore is difficult for people to perceive. (3.3.2 Labels or Instructions (Level A))
- **Don't put `aria-label`/`aria-labelledby` on elements that shouldn't be named:** Examples include plain `<div>`, `<span>`, and other custom elements without a role. These attributes are only intended for providing accessible names for elements that have explicit or implicit widget (for example, button, link, and tab), landmark, image, or iframe roles. (1.3.1 Info and Relationships (Level A))
  - **Caveat:** Custom elements may have an implicit role set via `ElementInternals`, so the absence of a `role` attribute isn't conclusive.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/accessibility/accessibility.md#L95-L186). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
