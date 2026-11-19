## Excluding a `details` element’s contents from find-in-page

If it’s undesirable for a `details` element’s contents to be included in what’s matched with the browser’s find-in-page feature, hide the closed contents with `display: none`. To keep the slide animation, set the collapsed size in `@starting-style`. See {{ GUIDE_REF("animate-element-entry-exit") }} for more details.

```css
.accordion.unsearchable > details {
	/* Excludes the contents from find-in-page */
	&:not([open])::details-content {
		display: none;
	}

	/* Where the opening transition starts from, since display: none has no size */
	&[open]::details-content {
		@starting-style {
			block-size: 0;
		}
	}
}
```

## Custom accordion

Use a custom accordion only when each item is a section of the page that needs its own heading, such as a FAQ or a long reference page where screen reader users move between items by heading.
It costs JavaScript for every behavior, including exclusivity, so prefer `details` everywhere else.

Place the `button` inside the heading so the heading keeps its semantics, and put the content element immediately after the heading.
Hide the content with `hidden="until-found"` so it stays findable, or with plain `hidden` to exclude it from find-in-page.
`aria-controls` on the trigger is optional; screen readers gain nothing from it.

```html
<section class="accordion" aria-labelledby="faq-heading">
	<h2 id="faq-heading">Frequently Asked Questions</h2>
	<h3>
		<button type="button" commandfor="answer-1" command="--toggle" aria-expanded="false">How do I reset my password?</button>
	</h3>
	<div id="answer-1" hidden="until-found"><!-- Answer --></div>
</section>
```

```javascript
document.addEventListener("command", event => {
	if (event.command !== "--toggle") return;
	const content = event.target;

	content.hidden = content.hidden ? false : "until-found";
	event.source.setAttribute("aria-expanded", !content.hidden);
}, { capture: true }); // Command events do not bubble, hence capture

// Find-in-page reveals the content directly, so mirror that into the trigger
document.addEventListener("beforematch", event => {
	document.querySelector(`[commandfor="${CSS.escape(event.target.id)}"]`)?.setAttribute("aria-expanded", "true");
});
```

To make it exclusive, hide the other items' content and reset their triggers in both handlers, since find-in-page can also open an item.
See {{ GUIDE_REF("custom-button-actions") }} for more details on custom commands and {{ GUIDE_REF("search-hidden-content") }} for `hidden="until-found"`.

## Fallback strategies

### Mutually exclusive `details`

{{ BASELINE_STATUS("details-name") }}

In browsers that don't support `name` on `details`, several items stay open, which is still a working (non-exclusive) accordion.
If the exclusivity is crucial to the user experience, you can implement a fallback. It also keeps always-open accordions working, since the open item still closes when another opens:

```javascript
// Only needed where the name attribute is unsupported
if (!Object.hasOwn(HTMLDetailsElement.prototype, "name")) {
	document.addEventListener("toggle", event => {
		const details = event.target;
		if (!(details instanceof HTMLDetailsElement) || !details.open || !details.hasAttribute("name")) return;

		const name = CSS.escape(details.getAttribute("name"));
		for (const other of document.querySelectorAll(`details[name="${name}"]`)) {
			if (other !== details) other.open = false;
		}
	}, { capture: true }); // toggle does not bubble, hence capture
}
```

### Expand all and Collapse all

{{ BASELINE_STATUS("invoker-commands") }}

If your Baseline target does not support invoker commands, the button does nothing. Feature-detect with `Object.hasOwn(HTMLButtonElement.prototype, "commandForElement")` and fall back to a `click` listener that runs the same loop. See {{ GUIDE_REF("custom-button-actions") }} for more details.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/accordion/guide.md#L255-L341). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
