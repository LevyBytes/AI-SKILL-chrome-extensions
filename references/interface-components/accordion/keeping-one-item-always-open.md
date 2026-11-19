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


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/accordion/guide.md#L73-L117). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
