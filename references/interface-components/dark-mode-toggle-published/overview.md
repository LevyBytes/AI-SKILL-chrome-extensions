Related section: [Two or three states?](two-or-three-states.md).
# Dark mode toggles

A dark mode toggle lets users override the system color scheme for one site.
The override is applied by updating `<meta name="color-scheme">`: `light dark` means "follow the system preference", `light` or `dark` pin an explicit scheme.
Colors (`light-dark()`), system colors, and native UI all key off the CSS `color-scheme` property, so the toggle works by keeping that property in sync with the `<meta>` (see [Reflect the override in CSS](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/dark-mode-toggle.md#reflect-the-override-in-css)).

## Persistent toggle, settings control, or no toggle at all?

Most sites do not need a persistent color scheme toggle in the site UI (header, nav, footer, etc.).
Follow the system preference by default and, if a manual override is needed at all, put the control in a separate settings surface: a settings page, panel, or overlay.

Pinning a scheme against the OS is a legitimate but rare intent, and rare intents belong behind progressive disclosure, not in a control that is visible at all times.

Persistent toggles are mostly found on developer-facing or developer-adjacent (e.g. for designers) sites, where switching schemes is a far more frequent task than it is for the average web user.
Do NOT add one just because it is a common pattern on developer sites: the developer's interest in this control is not representative of typical users.

## Implementation

First, follow all steps in `dark-mode` (via `npx -y modern-web-guidance@latest retrieve "dark-mode"`) to support both schemes, defaulting to the system preference.

### Data model

The data model for the dark mode toggle typically includes three states:
1. System (no stored value): The UI follows the system color scheme. Ideally this should be the default.
2. Light (stored as `"light"`): The UI uses the light theme regardless of the system color scheme.
3. Dark (stored as `"dark"`): The UI uses the dark theme regardless of the system color scheme.

This state is usually stored in `localStorage` and reflected in a `<meta name="color-scheme">` element in the document head.

### Reflect the override in CSS

The `<meta>` is only a *presentational hint*: any `color-scheme` declaration in author CSS overrides it.
Since `dark-mode` (via `npx -y modern-web-guidance@latest retrieve "dark-mode"`) sets `color-scheme: light dark` on `:root`, updating the `<meta>` alone is a **no-op** — CSS wins.
Map the `<meta>` back to the property so the cascade follows it:

```css
:root {
  color-scheme: light dark;

  &:has(> head > meta[name="color-scheme"][content="dark"]) {
    color-scheme: dark;
  }
  &:has(> head > meta[name="color-scheme"][content="light"]) {
    color-scheme: light;
  }
}
```

**DO NOT** hardcode `color-scheme: light` or `color-scheme: dark` as the root default; the base declaration MUST stay `light dark`.
CSS MUST NOT depend on JS: if JS never runs, the `<meta>` stays `light dark` and the site follows the system preference — nothing breaks.

### Persistence and FOUC prevention

Persist the override in `localStorage`; remove the entry when returning to the system default.

To avoid a flash of the wrong scheme, apply the stored value in an inline script (NOT `type=module`, NOT `defer`) placed immediately after the `<meta>` element:

```html
<meta name="color-scheme" content="light dark">
<script>
document.querySelector('meta[name="color-scheme"]').content = localStorage.getItem("color-scheme") ?? "light dark";
</script>
```

- This inline script exists **only** for FOUC prevention. Keep it as small as possible; additional JS for handling color scheme toggling can load later.
- In rare cases `localStorage` access can throw (e.g. site data blocked), but since this script does nothing else, the only side effect would be a console error. Wrap in `try .. catch` if this matters. Ensure the theme is still applied to the page, even if it cannot be persisted.
- The override can change from another tab: handle `window`'s `storage` event to stay in sync.
- **DO NOT** use `matchMedia()` to remove the stored value when the system preference changes to match it.
Many users' OS switches schemes automatically based on time of day; removing the stored value whenever the two happen to coincide would make it impossible to pin a scheme at all.

### Branching for HTML and non-color values

Colors need no extra work: once the `<meta>` is mapped to `color-scheme` (above), `light-dark()` follows the override.
This section is about adapting other values (e.g. `font-weight`, media sources, etc.).

When the page simply follows the system preference, `(prefers-color-scheme: dark)` can be used for branching, including in `<picture>` or `<video>` sources.
Overriding the color scheme adds an additional complication: the system preference is no longer the source of truth, and for APIs that only accept media queries there is no direct alternative.

Do NOT rely exclusively on JS-applied classes like `.dark` for branching, as they will be incorrect if JS doesn't load and the OS default is dark.

You can combine the media query with a `:root:has(> head > meta[name="color-scheme"][content="dark"])` (or `light`) selector to branch.
See `selector-atrule-combinations` (via `npx -y modern-web-guidance@latest retrieve "selector-atrule-combinations"`) for details on how to implement this elegantly.

The control's own options are non-color branches too: include both states in the markup (icon plus visually hidden action text, e.g. "Switch to dark theme") and hide the inactive one via these selectors.
`display: none` also removes the redundant option from the AT so the control needs no JS to stay current when the system preference changes.

For in-HTML media, the only way right now is to include both versions as separate elements and toggle visibility appropriately.
Hiding `<source>` elements with `display: none` does not work.

## User Interface


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/dark-mode-toggle.md#L1-L91). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
