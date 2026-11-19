### Naming mechanisms

- **Prefer native naming mechanisms:** `<label>` for form controls, `<caption>` for `<table>`, `<legend>` for `<fieldset>`, `<figcaption>` for `<figure>`. (Best Practice)
- **Explicitly associate `<label>` with its control via `for`/`id`:** As well as ensuring the control is appropriately labeled by the contents of the `<label>` element, this results in a larger target area for people to activate the label _or_ its related control to move focus to the control, which isn't globally supported with other forms of labeling (such as using the `aria-labelledby` attribute). Additionally, some assistive technologies, particularly voice recognition software, require the `for`/`id` relationship to be explicitly set, even if an equivalent accessibility-supported approach (such as nesting an `<input>` inside a `<label>`) is taken. (4.1.2 Name, Role, Value (Level A))
- **Prefer `aria-labelledby` over `aria-label` when a visible label exists:** This avoids duplication, improves maintainability, and translates better. (Best Practice)
- **Don't use `title` as a naming mechanism:** The value of this attribute is only displayed on mouse hover, and cannot be displayed or otherwise accessed using the keyboard in any browser. (Best Practice)
  - **Caveat:** `<iframe>` is an exception, as the `title` attribute is the standard way of providing an accessible name for this element.
- **Don't use `placeholder` as a naming mechanism:** While the value of this attribute is initially displayed inside an `<input>` or `<textarea>`, it disappears as soon as the user enters text into the field, meaning that there is no longer a visual cue as to what the field represents. The contrast between `placeholder` text and its background in most browsers is very low, and therefore is difficult for people to perceive. (3.3.2 Labels or Instructions (Level A))
- **Don't put `aria-label`/`aria-labelledby` on elements that shouldn't be named:** Examples include plain `<div>`, `<span>`, and other custom elements without a role. These attributes are only intended for providing accessible names for elements that have explicit or implicit widget (for example, button, link, and tab), landmark, image, or iframe roles. (1.3.1 Info and Relationships (Level A))
  - **Caveat:** Custom elements may have an implicit role set via `ElementInternals`, so the absence of a `role` attribute isn't conclusive.

### Choosing the name

- **Avoid inconsistent link text:** If multiple hyperlinks direct users to the same target page, make sure each link has the same accessible name, which should typically be the same as its visible link text. For example, if the target page for a link is `profile.html`, make sure that all links have an accessible name of "My Profile" **or** "Profile"; do not use "My Profile" in one instance, and "Profile" in the other. (Best Practice)
- **Disambiguate controls that look visually identical but which perform different actions by their accessible name:** For example, a page may include multiple "Edit" buttons, each of which triggers functionality to perform a different action, such as edit the user's name, edit the user's password, and edit the user's address. While it may be visually obvious from the surrounding content what the purpose of these buttons might be, screen reader users may only hear "Edit, button". Techniques to resolve this include the following: (4.1.2 Name, Role, Value (Level A))
  - **Use visually hidden text:** The text is included in the DOM but is visually hidden using CSS. For example `<button>Edit <span class="visually-hidden">first name</span></button>`. Refer to the [code example: visually hidden utility](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#code-example-visually-hidden-utility) for the full CSS.
  - **Apply the `aria-label` attribute to the control:** The value of this attribute should then include the visible text as well as important contextual information, for example `<button aria-label="Edit name">Edit</button>`, `<button aria-label="Edit address">Edit</button>`, and so on.
  - **Use the `aria-labelledby` or `aria-describedby` attribute to associate the control with the content it relates to:** Chaining IDs in `aria-labelledby` appends the related text to the control's accessible name (for example, `<p id="firstName">First name</p> <button id="editFirstName" aria-labelledby="editFirstName firstName">Edit</button>`), whereas `aria-describedby` provides the context as an accessible description (`<p id="firstName">First name</p> <button aria-describedby="firstName">Edit</button>`).
- **Do include a control's visible text in its accessible name:** Any visible text used to label a control must be included exactly as written in the control's accessible name. The accessible name can include additional information before or after the visible text, but the visible text itself must not differ. For example, the accessible name for a link containing the link phrase "Read more" can be "Read more about [subject]", because the visible text is included without modification. However, the accessible name cannot be "Read some more about [subject]", because the term "some" appears between the words "Read" and "more", which is not reflected in the visible text. (2.5.3 Label in Name (Level A))
- **Don't reuse an accessible name across controls with different effects in the same view:** Make sure that each accessible name is disambiguated. (4.1.2 Name, Role, Value (Level A))
  - **Caveat:** Having two separate buttons with the accessible name of "Close" in two separate dialog boxes is fine, because only one dialog box is reachable at a time; however, multiple "Edit" buttons for different effects in the same dialog box is not.
- **Don't reuse an accessible name across hyperlinks that point to different `href` targets:** For example, avoid `<a href="annualreport2025.html">Annual Report</a>` and `<a href="annualreport2026.html">Annual Report</a>`. Use `<a href="annualreport2025.html">Annual Report 2025</a>` and `<a href="annualreport2026.html">Annual Report 2026</a>` (or an equivalent technique for disambiguating controls) instead.
- **Don't pack descriptions, error messages, or instructions into the label:** Verbose labels confuse and frustrate people who use screen readers. Instead, use the `aria-describedby` attribute to programmatically associate any additional content with the field. For example: `<label for="yourComments">Your comments</label><p id="yourCommentsWarning">Please do not include any personal information in this field.</p><textarea id="yourComments" aria-describedby="yourCommentsWarning"></textarea>`. Screen readers will then announce the label first, followed by the control type, and only then announce additional information that a user can skip if they are already aware of it. (Best Practice)
- **Don't repeat state information already exposed by ARIA inside the label:** Examples include information exposed via the `aria-expanded`, `aria-checked`, `aria-selected`, `aria-pressed`, and similar attributes. This creates duplication, redundancy, and ambiguity. (Best Practice)
- **Don't include the role name in the label:** This will lead to duplication. For example, `<nav aria-label="Primary navigation">` will be read by screen readers as "Primary navigation, navigation". (Best Practice)

### Descriptions

- **Identify instructions, error messages, and any other important information explicitly related to a control as a description:** Examples of descriptions include: (1.3.1 Info and Relationships (Level A))
  - A list of password requirements when creating an account
  - An error message related to a field in a previously submitted form
  - Additional instructions, such as "You must agree to the terms and conditions before you can submit the form"
- **Make sure the description is available to assistive technologies when the related element receives focus:** Take one of the following approaches (1.3.1 Info and Relationships (Level A)):
  - If the description is already visible on the page, programmatically associate it with the element using the `aria-describedby` attribute.
  - If the description is not visible on the page and is explicitly for screen reader users (in other words, when providing a visible description is not appropriate or useful), apply the `aria-description` attribute to the element and use it to provide an appropriate description.
- **Avoid including a description for every element:** if the primary label already provides sufficient information (such as "First name"), any additional description is likely to be redundant. (Best Practice)
  - **Caveat:** Inline error messages associated with controls, such as error messages below / above text fields, as well as secondary labels that should be announced when the element receives focus, are exceptions.
- **Avoid including information in the description that is already provided by attributes applied to the element:** For example, including "This is a required field" as a description for an `<input>` element that already includes the `required` attribute will lead to duplicate announcements. (Best Practice)
  - **Caveat:** `aria-invalid="true"` is an exception; many screen readers announce "invalid" when they reach an `<input>` that includes this attribute set to `true`, which indicates that the field is in error. However, it does not indicate what the error is. In such cases, a description (the actual human readable error message) is required. This attribute should only be applied and set to true when the error message is present.
- **Avoid including interactive elements in an `aria-describedby` target** unless the content of the element reads sensibly as a description on its own. For example: (Best Practice)
  - This is acceptable, as the entire text string makes sense when announced: `<p id="description">I understand the <a href="tandc.html">terms and conditions</a>.</p>`
  - This is not appropriate, as the description will be announced as "Please don't include personal information in this field. Learn more.", where "Learn more" will be announced out of its intended context: `<p id="description">Please don't include personal information in this field. <a href="…">Learn more</a></p>`. Instead, only include the plain text in the referenced description: `<p><span id="description">Please don't include personal information in this field.</span> <a href="…">Learn more</a></p>`.

### Code Example: Visually Hidden Utility

A `.visually-hidden` utility provides text for screen readers without rendering it visually. It's commonly used for skip links, additional context on icon-only buttons, and supplementary labels.

```css
/* Hides content visually but keeps it in the accessibility tree.
   :focus-within / :active opt elements out — useful for skip links and
   any focusable content wrapped in this class. */
.visually-hidden:where(:not(:focus-within, :active)) {
  position: absolute !important;
  clip-path: inset(50%) !important;
  overflow: hidden !important;
  width: 1px !important;
  height: 1px !important;
  margin: -1px !important;
  padding: 0 !important;
  border: 0 !important;
  white-space: nowrap !important;
}
```

When the hidden content is focusable (skip links, focus-receiving wrappers), the `:focus-within`/`:active` exception lets it become visible. Style the visible state per situation, e.g. a skip link to the main content typically wants fixed positioning at the top-left of the viewport so the rest of the page doesn't shift.

## 4. Document Metadata and Language

### Language

- **Do declare the page's human language:** Always apply the `lang` attribute to the page's `<html>` element, and always set it to the primary human language of the page's content. For example, `<html lang="en">`. (3.1.1 Language of Page (Level A))
- **Do declare changes in the page's human language:** If there is a language change on the page, apply the `lang` attribute to the parent/container element for the affected content, and set the value of this attribute to the shortcode for the language of the affected content. For example: `<p>In Germany, you may be greeted by someone saying <span lang="de">Guten Morgen</span>.</p>`. (3.1.2 Language of Parts (Level AA))
- **Don't set the value of the `lang` attribute to a value that doesn't match the human language of the content:** This causes screen readers and other text-to-speech software to announce the content in a non-understandable manner. (3.1.1 Language of Page (Level A), 3.1.2 Language of Parts (Level AA))

### Titles

- **Do include the `<title>` element in the `<head>` section for all pages:** This includes pages embedded into a document using an `<iframe>`. (2.4.2 Page Titled (Level A))
- **Provide unique page titles:** Every page should have its own title that unambiguously reflects the page's purpose or content. (2.4.2 Page Titled (Level A))
- **Front-load the page's `<title>` with unique content:** For example, `<title>Page Topic | Site Name</title>`. (Best Practice)
- **Update single-page application (SPA) titles during page transitions:** For example, if the page title is `<title>Contact Us</title>` when a contact form is displayed, update the title to `<title>Thank you for contacting us!</title>` when the form is successfully submitted. (2.4.2 Page Titled (Level A))
- **Don't include an empty `<title>` element in the `<head>` section of a page:** No matter how short or inconsequential a page appears, do not use `<title></title>`. Page titles appear in the browser tab, so pages are distinguishable when users have multiple tabs open, and are typically announced by screen readers when the page is opened. (2.4.2 Page Titled (Level A))
- **Avoid using the same title for multiple pages, or using ambiguous page titles:** In such cases, pages are indistinguishable without reviewing the actual page content itself. (2.4.2 Page Titled (Level A))

### Iframes

- **Do provide a descriptive `title` for `<iframe>` elements:** All `<iframe>` elements should include a `title` attribute set to a value that unambiguously describes the contents of the `<iframe>`. (4.1.2 Name, Role, Value (Level A))
- **Don't disable iframe scrolling** using `scrolling="no"` (deprecated) or `overflow: hidden` on iframes. Users who zoom in or enlarge text need to scroll to reach content that overflows. (1.4.4 Resize Text (Level AA), 1.4.10 Reflow (Level AA))


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#L181-L268). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
