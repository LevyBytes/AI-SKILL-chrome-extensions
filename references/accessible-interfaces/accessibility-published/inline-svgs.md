### Inline SVGs

- **Do apply `role="img"` to the `<svg>` element for non-decorative SVGs:** This is so that they are globally exposed as images. (4.1.2 Name, Role, Value (Level A))
- **Do provide a text description for non-decorative SVGs:** Use one of the following techniques: (1.1.1 Non-text Content (Level A))
  - Include a nested `<title>` element as a child of the `<svg>` element that includes the text description. **or**
  - Apply the `aria-label` attribute to the `<svg>` element and set its value to an appropriate text description.
- **Do hide decorative SVGs from assistive technologies:** Apply `aria-hidden="true"` to decorative `<svg>` elements to prevent screen readers from announcing them. (1.1.1 Non-text Content (Level A))

#### Code Example: Providing a text description for non-decorative SVGs using the `<title>` element

```html
<!-- Inline non-decorative SVG: example that uses the <title> element -->
<svg role="img" viewBox="0 0 24 24">
  <title>Home</title>
  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
</svg>
```

#### Code Example: Providing a text description for non-decorative SVGs using the `aria-label` attribute

```html
<!-- Inline non-decorative SVG: example that uses the aria-label attribute -->
<svg role="img" viewBox="0 0 24 24" aria-label="Home">
  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
</svg>
```

#### Code Example: Identifying decorative SVGs

```html
<!-- Inline Decorative SVG (hide from assistive technologies) -->
<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
</svg>
```

### Complex images and charts

- **Provide long descriptions for complex images:** Use `<figure>`/`<figcaption>` or `aria-describedby` for charts and infographics. (1.1.1 Non-text Content (Level A))
- **Provide semantic data tables as alternatives:** Provide semantic data tables as accessible alternatives for charts and other complex visualizations. (1.1.1 Non-text Content (Level A))

#### Code Example: Complex graph with figcaption

```html
<!-- Complex graph with figcaption -->
<figure>
  <img src="chart.png" alt="Sales growth graph 2024.">
  <figcaption>Sales grew 20% in Q3 due to new platform launch.</figcaption>
</figure>
```

### Audio and video

- **Mandatory - Provide a transcript for audio-only content and combined video & audio content:** The transcript should be verbatim, and include all of the dialogue as well as text descriptions of important non-speech sounds such as sound effects. (1.2.1 Audio-only and Video-only (Prerecorded) (Level A), 1.2.3 Audio Description or Media Alternative (Prerecorded) (Level AA))
- **Mandatory - Provide a text description or an audio track for video-only content:** Examples include text-based instructions for an animation on how to use a particular product, and a separate audio track that includes a description of the action in the video. (1.2.1 Audio-only and Video-only (Prerecorded) (Level A))
- **Mandatory - Provide synchronous captions for videos:** Supply WebVTT captions for audio tracks within video content. The captions should be verbatim and synchronous with the audio track, and include all of the dialogue as well as meaningful non-speech content such as sound effects and other important information conveyed within the soundtrack (for example, "Ominous music plays"). (1.2.2 Captions (Prerecorded) (Level A))
  - **Caveat:** Captions are not required if the video is a decorative alternative for text that is already present and is clearly identified as such.
- **Do provide an audio description for videos:** Include an additional audio track within the video that augments the visual content displayed on-screen. The audio description should convey information about the scene that is not described or spoken in the main audio track, and should be conveyed during existing pauses in the dialogue. (1.2.3 Audio Description or Media Alternative (Prerecorded) (Level A), 1.2.5 Audio Description (Prerecorded) (Level AA))

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

- **Alt text for CSS generated content:** Use the alternative text argument of `content` (e.g. `content: url(icon.svg) / "Save";`) and keep meaningful text in the DOM. See `accessible-generated-content` (via `npx -y modern-web-guidance@latest retrieve "accessible-generated-content"`) for more details. (1.1.1 Non-text Content (Level A))

### Content Visibility Decision Matrix

| Intent | Visual | Screen Reader | Focusable | Structural Pattern |
| :--- | :--- | :--- | :--- | :--- |
| **Visible to all** | Yes | Yes | Yes | Standard rendering |
| **Screen Reader only** | No | Yes | Yes (if interactive) | Visually hidden utility (e.g. `.visually-hidden`) |
| **Visual only** | Yes | No | No | `aria-hidden="true"` |
| **Hidden for all** | No | No | No | `hidden` attribute / `display: none` |

**Heuristic Rule:** If an element can receive keyboard focus, it must not be hidden via `aria-hidden="true"`.

**Note:** only use screen reader only content as a last resort. If content is important, it should be visible for everyone.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/accessibility/accessibility.md#L373-L467). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
