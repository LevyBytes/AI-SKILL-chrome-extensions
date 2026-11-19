Related section: [Language Support](language-support.md).
```yaml
---
name: summarizer
description: Summarize text content using the on-device Summarizer API.
web-feature-ids:
  - summarizer
---
```

# Summarizer

The **Summarizer API** allows web developers to offer local, AI-powered text distillation directly within the browser using **Gemini Nano in Chrome or Phi in Edge**. This API supports various formats, including key points, headlines, and TL;DRs, while operating entirely on-device to ensure user privacy.

---

## Getting Started

The Summarizer API is available starting in **Chrome and Edge 138**. It requires a one-time model download of Gemini Nano or Phi (respectively).

### Hardware & Software Requirements

- **OS**: Windows 10/11, macOS 13+, Linux, or ChromeOS (Chromebook Plus).
- **Storage**: 22GB free space for the profile volume.
- **RAM/CPU**: 16GB+ RAM and 4+ CPU cores.
- **VRAM**: 4GB+ (if using GPU).

### Model Download and Availability

Check if the model is ready, needs downloading, or is unavailable. 

**Mandatory Options Passing:** You must pass the identical configuration options object to both `Summarizer.availability(options)` and `Summarizer.create(options)`. Do NOT use the deprecated `window.ai.summarizer` API surface.

**Mandatory Progress Monitoring:** You MUST implement a monitor for model download progress by providing a `monitor(m)` callback to `Summarizer.create()` and adding a listener for the `downloadprogress` event.

**User Gesture Requirement:** When `availability` is `'downloadable'` or `'downloading'`, triggering the actual download via `Summarizer.create()` requires a user gesture (such as a user click). You must place the creation call inside an event listener rather than calling it unconditionally on page load to prevent `NotAllowedError`.

```javascript
const options = {
  type: 'key-points',
  format: 'plain-text',
  length: 'medium'
};

const availability = await Summarizer.availability(options);

if (availability === 'available') {
  const summarizer = await Summarizer.create(options);
  // Ready to use immediately
} else if (availability === 'downloadable') {
  // A user gesture is strictly required to start the download
  document.getElementById('start-download-btn').addEventListener('click', async () => {
    const summarizer = await Summarizer.create({
      ...options,
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          console.log(`Downloaded ${Math.round((e.loaded / e.total) * 100)}%`);
        });
      },
    });
  });
}
```

## API Functions & Configuration

When creating a summarizer via `Summarizer.create(options)`, you can customize
the output:

| Parameter    | Options                                    | Description                             |
| :----------- | :----------------------------------------- | :-------------------------------------- |
| `type`       | `key-points`, `tldr`, `teaser`, `headline` | Defines the summary strategy.           |
| `format`     | `markdown`, `plain-text`                   | Output syntax style.                    |
| `length`     | `short`, `medium`, `long`                  | Target length (e.g., 1 vs 5 sentences). |
| `preference` | `auto`, `speed`, `capability`              | Balances latency vs. quality.           |

### Example Configuration

```javascript
const options = {
  sharedContext: 'This is a scientific article',
  type: 'key-points',
  format: 'markdown',
  length: 'medium',
};

if (navigator.userActivation.isActive) {
  const summarizer = await Summarizer.create(options);
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/built-in-ai/summarizer/guide.md#L1-L88). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
