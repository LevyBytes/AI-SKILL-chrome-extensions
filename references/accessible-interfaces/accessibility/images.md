### Images

- **Mandatory - Apply the `alt` attribute to all `<img>` elements:** browsers replace the image with the value of this attribute for people who use screen readers. (1.1.1 Non-text Content (Level A))
- **Do provide informative visual descriptions:** Describe the purpose of the image (for example, "Search", not "Magnifying glass"). (1.1.1 Non-text Content (Level A))
- **Do apply `alt=""` to decorative visuals:** This prevents screen readers from announcing them. (1.1.1 Non-text Content (Level A))
- **Don't use clichéd prefixes:** Avoid terms like "Image of…" and "Picture of…". (Best Practice)
- **Don't use underscores in filenames:** Use dashes if the filename might be announced as fallback. (Best Practice)

#### Code Example: Providing a text description for `<img>` elements

```html
<!-- Decorative -->
<img src="divider.png" alt="">

<!-- Informative (Functional) -->
<a href="/search">
  <img src="glass.png" alt="Search the platform">
</a>
```

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


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/accessibility/accessibility/guide.md#L358-L436). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
