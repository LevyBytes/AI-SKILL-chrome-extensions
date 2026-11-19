- Pressing `Enter` key without `Shift` on a textarea when composition is NOT active MUST submit the form or call the send logic.
- Pressing `Enter` key on a textarea when composition IS active (`isComposing` is true), or when the browser signals an IME-consumed keystroke (`event.keyCode === 229`), MUST NOT submit the form or send the message.
- Pressing `Shift+Enter` key on a textarea MUST NOT submit the form and should instead allow normal newline insertion.
- The interface MUST include a semantic, visible submit button (e.g. `<button type="submit">` or similar) to provide a non-keyboard path for submission.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/forms/ime-safe-enter-submit/expectations.md#L1-L4). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
