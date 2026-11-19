Related section: [Dark mode toggle](overview.md).
### Two or three states?

In all cases, the UI MUST support reverting or setting the color scheme to system.

Prefer displaying two states in space-constrained toggles, such as persistent toggles in the site chrome (header, nav, footer, etc.) where space is limited and tweaking settings is usually orthogonal to the user goal.

A color scheme control in a separate settings surface (page, panel, or overlay) is a different scenario and MAY expose all three states explicitly ("Light", "Dark", "System"): there, the user is already making deliberate decisions about future behavior, and there is room to explain the options.

Three explicit states are also warranted if the site implements context-aware schemes (e.g. a dimmer light mode when the OS is dark), since "Light" and "System (currently light)" then genuinely differ.

### Two-state toggles

When such a control is used, it tends to be a temporary comfort adjustment ("it's too bright right now"), rather than ensuring the current state is preserved long-term.
Therefore, for two-state toggles, it is sufficient to display two out of three settings: system (so that the setting can be reverted) and the current opposite of system, stored as its current literal value.

The only two states should be:

1. **System default** — no stored value, `<meta>` content `light dark`. Displayed as its current resolved value (e.g. a sun icon when light).
2. **Override** — stored literally as `light` or `dark`.

Essentially, it is a tri-state control (`light dark`, `light`, `dark`) where the explicit state matching the current system preference is unreachable.

When the user toggles:

1. Target scheme = the opposite of the currently *rendered* scheme (stored value if any, else system preference). The user intent is "select the opposite of what I see right now", NOT "select the inverse of the system default".
2. If the target differs from the current system preference, store it literally.
3. If the target matches the current system preference, the user is undoing their adjustment: remove the stored value. DO NOT store it — that would invisibly pin the scheme against future system changes.
4. Set the `<meta>` content to the stored value, or `light dark` if none.

IMPORTANT: Divergence must be checked only at storage time, never retroactively: a stored value that the system preference later changes to match MUST be kept.
Many users' OS switches schemes automatically based on time of day; removing the stored value whenever the two happen to coincide would make it impossible to pin a scheme at all.

Example scenario, starting with the OS set to light:

1. The user toggles. Dark differs from the system preference, so `dark` is stored; the site turns dark.
2. The OS setting changes to dark. The site stays dark (the stored value now matches the system preference, but is kept).
3. The OS setting changes back to light. The site stays dark.
4. The user toggles. The target (light) matches the system preference, so the stored value is removed and the site follows the system again.

### Three-state toggles

When there is more space and users are already in the mindset of setting long-term preferences, a tri-state control can provide more clarity.
In this case, the data model cleanly maps to the three UI options: system, light, and dark.

To reduce cognitive load, the "system" option should also display what the current system setting is, for example via:
- Icon, e.g. a sun icon at the bottom right of the system icon
- Text, e.g. "System (Currently light)"

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-components/dark-mode-toggle.md#L92-L138). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
