Related section: [Ime safe enter submit](overview.md).
### Strategy 2: The `event.timeStamp` window workaround (alternative)

For codebases that strictly forbid the use of deprecated APIs like `keyCode`, or if there are known issues with the `229` check in specific targeted environments, you can track the browser-reported event dispatch timestamp instead. 

Because Safari dispatches the confirming `Enter` keydown event extremely close to the `compositionend` event (often within 5ms, and sometimes with the keydown timestamp being slightly *earlier* due to handler delivery order inversion), checking the time difference is highly reliable and is unlikely to trigger false-positives on mobile virtual keyboards under standard conditions.

```js
let lastCompositionEndAt = null;

textarea.addEventListener('compositionend', (event) => {
  // IMPORTANT: Always use event.timeStamp, not Date.now() or performance.now().
  // Handler-time measurements are vulnerable to drift when the main thread is blocked.
  lastCompositionEndAt = event.timeStamp;
});

textarea.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();

    if (event.isComposing) {
      return;
    }

    // Block submission if the event occurs within a 50ms window of composition ending.
    // Math.abs handles Safari's inverted event delivery timing bug.
    if (
      lastCompositionEndAt !== null &&
      Math.abs(event.timeStamp - lastCompositionEndAt) < 50
    ) {
      return;
    }

    form.requestSubmit();
  }
});
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/forms/ime-safe-enter-submit/guide.md#L89-L124). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
