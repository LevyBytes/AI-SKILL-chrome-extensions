# User Scripts API

The `chrome.userScripts` API lets extensions run **arbitrary code provided by the user** at
runtime — code that cannot be shipped as part of the extension package. This is fundamentally
different from content scripts (which are bundled with the extension) and `chrome.scripting`
(which executes extension-owned code programmatically).

**Use userScripts when:** you are building a script manager, custom automation tool, or any
feature where the user supplies JavaScript that should run on web pages.  
**Use content scripts when:** the injected code is written by you and ships with the extension.  
**Use `chrome.scripting.executeScript` when:** you need one-off execution of known, extension-owned code.

## Manifest

```json
{
  "manifest_version": 3,
  "minimum_chrome_version": "120",
  "permissions": ["userScripts"],
  "host_permissions": ["https://example.com/*"]
}
```

- `"userScripts"` permission is required — without it `chrome.userScripts` is undefined.
- `host_permissions` must cover the sites where scripts will be injected.

## User Enablement — CRITICAL

**The `chrome.userScripts` API requires explicit user opt-in. Without it, the API throws on
property access.** Behavior differs by Chrome version:

| Chrome version | Requirement |
|----------------|-------------|
| < 138 | User must enable **Developer mode** at `chrome://extensions` |
| ≥ 138 | User must toggle **"Allow User Scripts"** on the extension's details page |

```js
// ❌ BROKEN — crashes if user hasn't enabled the API
await chrome.userScripts.register([{ id: 'foo', matches: [...], js: [...] }]);
// TypeError: Cannot read properties of undefined

// ✅ CORRECT — always guard before any chrome.userScripts.* call
function isUserScriptsAvailable() {
  try {
    chrome.userScripts; // throws if not enabled
    return true;
  } catch {
    return false;
  }
}

if (!isUserScriptsAvailable()) {
  document.getElementById('warning').style.display = 'block';
  document.getElementById('main-ui').style.display = 'none';
  return;
}
```

## Execution Worlds

| World | Constant | Behavior |
|-------|----------|----------|
| **USER_SCRIPT** (default) | `ExecutionWorld.USER_SCRIPT` | Isolated from host page JS; exempt from page CSP |
| **MAIN** | `ExecutionWorld.MAIN` | Shares JS context with the host page; can access page variables |

Use `USER_SCRIPT` (the default) for safety. Use `MAIN` only when the user's script explicitly
needs to interact with the host page's JavaScript environment.

Chrome 133+ supports multiple isolated worlds via `worldId`, letting different user scripts
run in separate execution environments without interfering with each other.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/skills-src/chrome-extensions/references/extensions/user-scripts.md#L1-L71). [Upstream licensing terms](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/README.md#license). Reorganized for this edition.
