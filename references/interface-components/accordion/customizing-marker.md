### Customizing the marker

`summary` renders as a list item, so its disclosure triangle is a `::marker`. Remove it with `list-style: none` and draw your own with `::before`, which unlike `::marker` can be sized, positioned, and animated.
Render the icon as a mask so it follows the text color, and rotate it for the closed state so one icon serves both states and both writing directions.
See {{ GUIDE_REF("icons") }} for more details on including and customizing icons via CSS.

Prefer keeping the marker directly next to the label text, not pushed to the opposite edge of the summary, especially for accordions that can get wide.
A marker far from its label makes it harder for users to associate with the correct label, and falls outside the field of view of users with low vision or screen magnification.
Right before the label text is preferable to right after, as it facilitates vertical scanning.

```css
summary {
	/* Removes the default triangle */
	list-style: none;
	display: flex;
	align-items: center;
	gap: 0.5ch;

	&::before {
		content: "";
		inline-size: 1em;
		block-size: 1em;
		flex-shrink: 0;
		background-color: currentColor;
		/* Example chevron pointing down, the open state; any single-color SVG works */
		mask: url("icons/chevron-down.svg") no-repeat center / contain;
		/* Closed: point toward the inline end */
		rotate: -90deg;
	}

	&:dir(rtl)::before {
		rotate: 90deg;
	}

	/* Rotate rather than swap icons, so the change can animate */
	details[open] > &::before {
		rotate: 0deg;
	}

	@media (prefers-reduced-motion: no-preference) {
		&::before {
			transition: rotate 0.2s;
		}
	}
}
```

### Slide up/down animation

To animate opening and closing, transition `block-size` between `0` and its intrinsic size, and transition `content-visibility` discretely so the content stays rendered until the collapse finishes.

```css
details::details-content {
	/* Lets block-size transition to and from its intrinsic auto size */
	interpolate-size: allow-keywords;
	overflow: clip;
	/* Keeps layout containment constant across states; otherwise content-visibility toggling it
	   makes the transition jitter when the content has outward margins (e.g. a nested p) */
	contain: layout;
}

details:not([open])::details-content {
	block-size: 0;
}

/* Only animate for users who have not asked for reduced motion */
@media (prefers-reduced-motion: no-preference) {
	details::details-content {
		transition: block-size, content-visibility, display;
		/* Example duration; match the surrounding motion design */
		transition-duration: 0.3s;
		transition-timing-function: ease-in-out;
		/* Defers content-visibility: hidden until the collapse ends */
		transition-behavior: allow-discrete;
	}
}
```

See {{ GUIDE_REF("animate-to-intrinsic-sizes") }} for more details.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/ui-components/accordion/guide.md#L175-L254). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
