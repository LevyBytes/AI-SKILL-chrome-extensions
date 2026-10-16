# Puppeteer Popup Testing

Open when testing an extension popup through its service worker using Jest and Puppeteer.

This CommonJS test assumes an extension fixture in ../extension with service-worker.js, a configured popup.html containing one ul/li, and Chrome 127+ for action.openPopup(). Install compatible Jest and Puppeteer versions; current Puppeteer supports enableExtensions. Run in a dedicated test profile, not your normal browser profile.

```js
const puppeteer = require("puppeteer");
const path = require("node:path");
const EXTENSION_PATH = path.resolve(__dirname, "../extension");
let browser, worker, extensionOrigin;

beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: false, pipe: true, enableExtensions: [EXTENSION_PATH],
  });
  try {
    const target = await browser.waitForTarget((target) => {
      if (target.type() !== "service_worker" ||
          !target.url().startsWith("chrome-extension://")) return false;
      const url = new URL(target.url());
      return url.pathname === "/service-worker.js";
    });
    worker = await target.worker();
    if (!worker) throw new Error("Extension worker unavailable");
    const url = new URL(target.url());
    extensionOrigin = `${url.protocol}//${url.host}`;
  } catch (error) {
    await browser.close();
    browser = undefined;
    throw error;
  }
});

afterEach(async () => {
  if (browser) await browser.close();
  browser = undefined;
});

test("popup renders correctly", async () => {
  await worker.evaluate(() => chrome.action.openPopup());
  const popupTarget = await browser.waitForTarget((target) =>
    target.type() === "page" && target.url() === `${extensionOrigin}/popup.html`
  );
  const popup = await popupTarget.asPage();
  if (!popup) throw new Error("Popup page unavailable");
  await popup.waitForSelector("ul li");
  const count = await popup.$$eval("ul li", (items) => items.length);
  expect(count).toBe(1);
}, 30000);
```

The assertion targets the popup itself. Give the fixture its expected data explicitly; a different popup needs different selectors and assertions. waitForTarget and waitForSelector retain their default bounded waits. When several extensions are loaded, additionally identify the intended extension before choosing its worker.

For unit-test setup, browser lifetime caveats and manual debugging, read [Test and debug](howto-test-debug.md).

Sources: [Chrome Puppeteer testing](https://developer.chrome.com/docs/extensions/how-to/test/puppeteer), [Puppeteer extension loading](https://pptr.dev/guides/chrome-extensions).
