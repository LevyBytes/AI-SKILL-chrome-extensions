Related section: [Content scripts](overview.md).
## DOM Manipulation Best Practices

- **Avoid blocking the main thread** when modifying many DOM elements. Use `requestAnimationFrame`
  to batch visual updates and `scheduler.yield()` to break up long-running tasks:

```js
// ❌ BAD: Blocks the main thread while processing hundreds of elements
const emails = document.body.innerText.match(/[\w.+-]+@[\w-]+\.[\w.]+/g);
emails.forEach(email => {
  // ... find and highlight each email (can freeze the page)
});

// ✅ GOOD: Process in batches using requestAnimationFrame
async function highlightEmails(elements) {
  const BATCH_SIZE = 20;
  for (let i = 0; i < elements.length; i += BATCH_SIZE) {
    const batch = elements.slice(i, i + BATCH_SIZE);
    await new Promise(resolve => requestAnimationFrame(() => {
      batch.forEach(el => el.style.backgroundColor = 'yellow');
      resolve();
    }));
    // Yield to the main thread between batches
    if (typeof scheduler !== 'undefined' && scheduler.yield) {
      await scheduler.yield();
    }
  }
}
```

- Use `MutationObserver` for dynamic pages (SPAs, infinite scroll)
- Namespace your CSS classes to avoid conflicts (e.g., `myext-highlight`)
- Use Shadow DOM for complex UI injected into pages
- Clean up on removal: `chrome.runtime.onMessage` listeners persist until the content script context is destroyed
- Use `TreeWalker` or `document.createNodeIterator` instead of regex on `innerHTML` for finding text in the DOM — this is more reliable and doesn't break event listeners

## `run_at` Timing

| Value | When |
|-------|------|
| `document_start` | Before DOM is constructed (useful for blocking) |
| `document_idle` | After DOM is ready but before all resources load (default, recommended) |
| `document_end` | After DOM is complete but before images/subframes |

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/skills-src/chrome-extensions/references/extensions/content-scripts.md#L71-L112). [Upstream licensing terms](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/README.md#license). Reorganized for this edition.
