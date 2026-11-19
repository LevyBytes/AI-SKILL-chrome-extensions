```yaml
---
name: accordion
description: "Build an accordion component with animation, optional exclusive (one-open-at-a-time) behavior, and brand-consistent styling."
web-feature-ids:
  - hidden-until-found
  - interpolate-size
  - transition-behavior
  - details-name
  - dir-pseudo
  - details
  - details-content
  - invoker-commands
guides:
  - search-hidden-content
  - animate-to-intrinsic-sizes
---
```

# Accordion

Build accordions from a set of adjacent `details` elements.

If the accordion is a distinct section of the page, group its items in an element with an accessible name, such as a `section` labeled by the group heading.

```html
<section class="accordion" aria-labelledby="faq-heading">
	<h2 id="faq-heading">Frequently Asked Questions</h2>
	<details>
		<summary>Lorem ipsum dolor sit amet?</summary>
		<!-- answer 1 -->
	</details>
	<details>
		<summary>Consectetur adipiscing elit?</summary>
		<!-- answer 2 -->
	</details>
</section>
```

**Warning:** Do not put headings inside `summary`. JAWS and TalkBack expose `summary` as a button and drop any heading inside it, so their users cannot move between items by heading.
If each item needs its own heading, build a custom accordion instead (see below).
{# JAWS: https://github.com/FreedomScientific/VFO-standards-support/issues/105 (wontfix). TalkBack: https://tetralogical.com/resources/accessible-components-library/compatibility/ #}

Accessibility notes:
- Do not wrap every small accordion in a landmark or `region`; that adds navigation noise for screen reader users.
- Do not add arrow key navigation, roving `tabindex`, or `Home`/`End` handling.
Accordion contents are often long enough to need scrolling, and arrow keys on a focused trigger are how keyboard users scroll.
- If a heading for the entire accordion is not desirable, use an `aria-label` on the container element to provide an accessible name for the group.

## Exclusive accordions

An exclusive accordion only allows one item to be open at a time.

To make an accordion exclusive, add the same `name` to each `details` element that should be part of the exclusive group.
Ensure that `name` is not used elsewhere on the page unless it is intended to be part of the same exclusive accordion group.

```html
<section class="accordion" aria-labelledby="faq-heading">
	<h2 id="faq-heading">Frequently Asked Questions</h2>
	<details name="faq-question">
		<summary>Lorem ipsum dolor sit amet?</summary>
		<!-- answer 1 -->
	</details>
	<details name="faq-question">
		<summary>Consectetur adipiscing elit?</summary>
		<!-- answer 2 -->
	</details>
</section>
```

Avoid exclusive accordions, as they can produce suboptimal user experience:
- Sometimes users want to reference between the contents of multiple items, which exclusive accordions prevent.
- They also can cause content to shift out of the user’s view which can cause significant problems for those using screen magnifiers.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/accordion/guide.md#L1-L72). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
