## Optional: Expand/Collapse All button

For non-exclusive accordions, a single button that expands or collapses every item can improve user experience.
Give it `aria-expanded` and keep it in sync with the items, so screen readers announce the change (VoiceOver does not reliably announce a label change on its own).
Mark it expanded only once every item is open; in a mixed state it reads "Expand all" and pressing it opens everything.
{# Maintainer note:
Pattern from https://tetralogical.com/resources/accessible-components-library/accordion/ .
Verified 2026-11-04 with VoiceOver on both iOS and macOS: every press announces the new label and state, e.g. "Collapse all, expanded, button", and closing an item directly flips the button back to "Expand all, collapsed". #}

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

## Styling

The disclosed content lives in the `::details-content` pseudo-element. While closed it is hidden with `content-visibility: hidden`, not `display: none`, which is what keeps it findable and lets its size animate. Style the item on `details`, the trigger on `summary`, and the content on `details::details-content`.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/accordion/guide.md#L118-L174). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
