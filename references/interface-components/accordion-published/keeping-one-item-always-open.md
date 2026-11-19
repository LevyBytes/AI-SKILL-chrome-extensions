### Keeping one item always open

To require that one item is always open, stop the open item’s `summary` from closing it and expose it as disabled. Opening another item still closes it through `name`. This compounds the downsides above, since users can never reclaim the space, so only use it when the layout depends on an item being open.

```html
<section class="accordion always-open" aria-labelledby="plans-heading">
	<h2 id="plans-heading">Plans</h2>
	<details name="plan" open>
		<!-- Mirrors the open state; the script keeps it in sync -->
		<summary aria-disabled="true">Basic</summary>
		<!-- Basic plan -->
	</details>
	<details name="plan">
		<summary>Pro</summary>
		<!-- Pro plan -->
	</details>
</section>
```

```javascript
// Enter and Space on a summary also dispatch click, so this covers keyboard too
document.addEventListener("click", event => {
	if (event.target.closest(".accordion.always-open details[open] > summary")) event.preventDefault();
});

// toggle does not bubble, hence capture
document.addEventListener("toggle", event => {
	if (!event.target.matches(".accordion.always-open details")) return;
	event.target.querySelector(":scope > summary").setAttribute("aria-disabled", event.target.open);
}, { capture: true });
```

Keep the disabled `summary` focusable so focus is not lost when the item a user just opened becomes disabled, but exclude it from hover and pointer styles so it does not look clickable:

```css
/* :where() keeps the guard from raising specificity */
summary:where(:not([aria-disabled="true"])) {
	cursor: pointer;

	&:hover {
		background: var(--color-hover);
	}
}
```

## Optional: Expand/Collapse All button

For non-exclusive accordions, a single button that expands or collapses every item can improve user experience.
Give it `aria-expanded` and keep it in sync with the items, so screen readers announce the change (VoiceOver does not reliably announce a label change on its own).
Mark it expanded only once every item is open; in a mixed state it reads "Expand all" and pressing it opens everything.

```html
<section class="accordion" id="support-accordion" aria-labelledby="support">
	<h2 id="support">Support</h2>
	<button type="button" commandfor="support-accordion" command="--toggle-all" aria-expanded="false">
		<span class="expand">Expand all</span>
		<span class="collapse">Collapse all</span>
	</button>
	<!-- Accordion items -->
</section>
```

```css
/* Show the label for the action the button will perform */
[command="--toggle-all"][aria-expanded="true"] .expand,
[command="--toggle-all"][aria-expanded="false"] .collapse {
	display: none;
}
```

```javascript
document.addEventListener("command", event => {
	if (event.command !== "--toggle-all") return;
	const expand = event.source.getAttribute("aria-expanded") !== "true";

	// Command events fire on the commandfor target
	for (const details of event.target.querySelectorAll(":scope > details")) {
		details.open = expand;
	}
}, { capture: true }); // Command events do not bubble, hence capture

// Items also open and close individually, so derive the button state from them
document.addEventListener("toggle", event => {
	if (!event.target.matches(".accordion > details")) return;
	const accordion = event.target.parentElement;
	const button = accordion.querySelector(':scope > [command="--toggle-all"]');
	if (!button) return;

	const items = accordion.querySelectorAll(":scope > details");
	button.setAttribute("aria-expanded", Array.prototype.every.call(items, details => details.open));
}, { capture: true }); // toggle does not bubble, hence capture
```

Separate buttons are also possible and improve discoverability, at the cost of _feedback_: there are states where one of the buttons will produce no visible result, and disabling it accessibly introduces challenges and increases complexity.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/accordion.md#L55-L149). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
