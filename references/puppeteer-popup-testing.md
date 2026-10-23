# Puppeteer Popup Testing

Open when testing an extension popup through its service worker using Jest and Puppeteer.

This CommonJS test assumes an extension fixture in ../extension with service-worker.js, a configured popup.html containing one ul/li, and Chrome 127+ for action.openPopup(). Install compatible Jest and Puppeteer versions; current Puppeteer supports enableExtensions. Run in a dedicated test profile, not your normal browser profile.

The complete program is in the [upstream source](https://developer.chrome.com/docs/extensions/how-to/test/puppeteer). The article assembles the test across several blocks for Chrome's `history/showHistory` sample. Correct these defects when adapting it:

- The final assertion queries `page`, the example.com tab, instead of `popup`. Query the popup, and wait for the list with `popup.waitForSelector("ul li")` before counting items.
- Match the service worker and the popup on the extension's own `chrome-extension://<id>` origin and exact path. The source's `endsWith` checks can select another extension's worker or page.
- Close the browser when the worker target never appears, and guard `afterEach` so a failed launch does not throw on `browser.close()`.
- Give the test a longer timeout, about 30 seconds, because launching Chrome with an unpacked extension is slow.

The assertion targets the popup itself. Give the fixture its expected data explicitly; a different popup needs different selectors and assertions. waitForTarget and waitForSelector retain their default bounded waits. When several extensions are loaded, additionally identify the intended extension before choosing its worker.

For unit-test setup, browser lifetime caveats and manual debugging, read [Test and debug](howto-test-debug.md).

Sources: [Chrome Puppeteer testing](https://developer.chrome.com/docs/extensions/how-to/test/puppeteer), [Puppeteer extension loading](https://pptr.dev/guides/chrome-extensions).
