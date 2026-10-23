# Test & Debug

> Manifest V3 API examples are fragments: run awaited calls inside an async handler and supply the shown input variables. Register worker listeners synchronously at startup; each API heading links to its official contract.

## Overview
Inspecting a running MV3 extension (service worker, popup, content scripts) from `chrome://extensions`, and driving automated tests with Jest, Puppeteer, and Selenium.

## Debugging a loaded extension
Load the extension unpacked first (see [howto-integrate-distribute.md](howto-integrate-distribute.md)), then debug from `chrome://extensions`.

- **Service worker**: click the blue **Inspect views** link (the service worker entry) to open DevTools; `console.log` output appears there. A red **Errors** button surfaces registration/runtime errors (**Clear all** resets it). Control the worker lifecycle via the **Service Workers** pane under the **Application** panel.
- **Popup**: right-click the open popup → **Inspect** for its own DevTools.
- **Content scripts**: errors appear in the host page's console; use the console context dropdown (next to **top**) to select your extension.

After any code change, reload the extension; ensure required APIs are declared as permissions.

## Unit testing with Jest
Test logic that does not touch `chrome` with plain Jest; mock the APIs otherwise. Register a setup file in `jest.config.js`, provide a global stub, and override per test with `jest.spyOn(...).mockResolvedValue(...)`.

```js
// jest.config.js
module.exports = { setupFiles: ["<rootDir>/mock-extension-apis.js"] };
```

```js
// mock-extension-apis.js
global.chrome = { tabs: { query: async () => { throw new Error("Unimplemented."); } } };
// A test fixture; production code should import its actual implementation.
async function getActiveTabId() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id === undefined) throw new Error("No active tab");
  return tab.id;
}
afterEach(() => jest.restoreAllMocks());
// a test
test("getActiveTabId returns active tab ID", async () => {
  jest.spyOn(chrome.tabs, "query").mockResolvedValue([{ id: 3, active: true, currentWindow: true }]);
  expect(await getActiveTabId()).toBe(3);
});
```

## End-to-end testing
Supported drivers: Puppeteer, Playwright, Selenium (via `ChromeOptions` / ChromeDriver), and WebDriverIO. Use a browser build and automation-driver version that supports extension loading. Current Puppeteer supports enableExtensions; old Headless Shell cannot load extensions. Chrome for Testing is suitable; do not assume branded Chrome accepts every historical loading flag. Fix the extension ID (via `key`) for allow-listing, and reach extension pages by URL (`chrome-extension://EXTENSION_ID/index.html`). Open the popup with `action.openPopup()` or by navigating to its URL.

## Driving an extension with Puppeteer

Open [Puppeteer popup testing](puppeteer-popup-testing.md) for a complete test with worker selection, popup assertions and browser cleanup.

Caveat: under Selenium/ChromeDriver the service worker may not terminate automatically as it would in normal usage.
