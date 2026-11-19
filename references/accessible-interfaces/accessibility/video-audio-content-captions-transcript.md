#### Code Example: Video and audio content with captions and transcript

```html
<!-- Video with Captions tracks -->
<video controls>
  <source src="intro.mp4" type="video/mp4">
  <track src="caps.vtt" kind="captions" srclang="en" label="English">
</video>

<!-- Audio with expandable transcript details -->
<audio controls src="podcast.mp3" aria-details="podcast-transcript"></audio>
<details id="podcast-transcript">
  <summary>View Transcript</summary>
  <div class="transcript-content">
    Welcome to the show...
  </div>
</details>
```

### CSS generated content

- **Alt text for CSS generated content:** Use the alternative text argument of `content` (e.g. `content: url(icon.svg) / "Save";`) and keep meaningful text in the DOM. See {{ GUIDE_REF('accessible-generated-content') }} for more details. (1.1.1 Non-text Content (Level A))

### Content Visibility Decision Matrix

| Intent | Visual | Screen Reader | Focusable | Structural Pattern |
| :--- | :--- | :--- | :--- | :--- |
| **Visible to all** | Yes | Yes | Yes | Standard rendering |
| **Screen Reader only** | No | Yes | Yes (if interactive) | Visually hidden utility (e.g. `.visually-hidden`) |
| **Visual only** | Yes | No | No | `aria-hidden="true"` |
| **Hidden for all** | No | No | No | `hidden` attribute / `display: none` |

**Heuristic Rule:** If an element can receive keyboard focus, it must not be hidden via `aria-hidden="true"`.

**Note:** only use screen reader only content as a last resort. If content is important, it should be visible for everyone.

## 7. Forms and Input Controls

### Labels and hints

- **Mandatory - Provide a label for all form controls:** Do not rely on the currently selected input or value as a way of labeling the control. (3.3.2 Labels or Instructions (Level A))
- **Connect Labels Programmatically:** Use `<label for="id">` linked to `<input id="id">`. (1.3.1 Info and Relationships (Level A))
- **Don't use placeholders as primary labels:** Placeholders are not persistent labels. Only use placeholders to provide  brief hints, such as an example of an appropriate input. (3.3.2 Labels or Instructions (Level A))
- **Link hints to inputs via `aria-describedby`:** Associate help text with inputs, and place the hint above the input so autocomplete popovers don't cover it during editing. (1.3.1 Info and Relationships (Level A))

#### Code Example: A labeled form control with a hint for passwords

```html
<!-- Good: Semantic forms with hints for passwords -->
<form>
  <label for="pwd">Password:</label>
  <span id="pwd-hint">Must contain at least 8 characters.</span>
  <input id="pwd" type="password" aria-describedby="pwd-hint" autocomplete="current-password" required>
</form>
```

### Input assistance and validation

- **Mandatory - Use the `autocomplete` attribute:** Apply the `autocomplete` attribute to `<input>`, `<textarea>`, and `<select>` elements that explicitly collect personal information about the user, and set it to the correct value (for example `"email"` or `"given-name"`). (1.3.5 Identify Input Purpose (Level AA))
- **Provide form validation constraints:** Use `required` (or `aria-required="true"` only when `required` isn't applicable) to signal mandatory inputs. (4.1.2 Name, Role, Value (Level A))
- **Don't trigger context shifts on focus changes:** Avoid auto-submitting forms or jumping pages on focus change events alone. (3.2.1 On Focus (Level A), 3.2.2 On Input (Level A))

## 8. Live Regions

Live regions let assistive tech announce content updates that aren't tied to navigation or focus changes. They're easy to misuse — too many regions, or noisy ones, quickly become spam for screen-reader users.

### Live Region Urgency Table

| Urgency | Visual Analogue | `aria-live` Value | Behavioral Impact | Example |
| :--- | :--- | :--- | :--- | :--- |
| **Critical** | Modal / Alert | `assertive` (or `role="alert"`) | Interrupts immediately, clears speech queue | Session timeout, API failure |
| **Standard**| Toast / Banner | `polite` | Announces at next graceful break | Search results, "Saved" status |
| **Passive**  | Silent text | `off` | Only if user navigates to it | Live character count |

**Heuristic Rule:** Use `assertive` only for critical, time-sensitive updates that require immediate attention or prevent safe continuation (e.g., data loss, session timeouts, or network drops).

### When to announce live regions

- **Announce dynamic errors via live regions:** Use `aria-live` or shift focus to error lists (4.1.3 Status Messages (Level AA)).
- **Don't use live regions for interstitial states** like "Loading…" or "Updating…" unless they're meaningfully informative — they usually just create noise. Use the HTML `<progress>` element or the ARIA `progressbar` role for this purpose instead. (Best Practice)

```html
<!-- Session Timeout Warning with controls -->
<div role="alert" class="timeout-warning">
  Your session will expire in 2 minutes.
  <button type="button" onclick="extendSession()">Extend Session</button>
</div>
```

### Managing announcements

- **Centralize live regions for non-visible announcements:** A single `polite` region and a single `assertive` region per page (with whatever `aria-atomic` configuration you need) keeps announcements consistent and easier to maintain. Many frameworks ship their own announcer abstraction — use it. (Best Practice)
- **Debounce frequently-changing regions:** If a region can update many times per second (e.g. a combobox's result count as the user types), debounce so users aren't spammed. (Best Practice)
- **Delay slightly when other announcements may collide:** When the user is typing or focus is being managed, a small delay before announcing keeps live-region updates from overlapping other speech. (Best Practice)
- **Don't add live-region updates to inert DOM:** When dialogs open or sections become `inert`, queued or debounced messages will be unannounced — or announced from DOM the user can't reach. Coordinate live-region updates with dialog/inert state changes. (4.1.3 Status Messages (Level AA))


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#L437-L532). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
