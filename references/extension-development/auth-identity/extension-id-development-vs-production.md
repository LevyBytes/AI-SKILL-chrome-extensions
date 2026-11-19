Related section: [Auth identity](overview.md).
### Extension ID: Development vs Production

**This is critical and often missed.** The OAuth `client_id` is tied to a specific extension ID.
The extension ID changes depending on how you load the extension:

| Context | How ID is determined |
|---------|---------------------|
| Unpacked (development) | Derived from the extension's directory path — changes if you move the folder |
| Packed (.crx) | Derived from the private key used to pack |
| Chrome Web Store | Assigned by the store, permanent |

**To get a stable ID during development**, add a `"key"` field to your manifest.json.
This ensures the same extension ID regardless of directory path:

1. Pack your extension once (`chrome://extensions` → Pack Extension)
2. Open the generated `.crx` as a ZIP, extract the `key` from its manifest
3. Add that key to your development manifest:

```json
{
  "key": "MIIBIjANBgkqhk...your-public-key-here...",
  "manifest_version": 3,
  "name": "My Extension"
}
```

Alternatively, note your unpacked extension's ID from `chrome://extensions` and configure
the OAuth client for that specific ID. Just be aware it will change if the folder moves.

**Always tell users:** "After publishing to the Chrome Web Store, update your OAuth client
configuration with the store-assigned extension ID."

## Non-Google OAuth (launchWebAuthFlow)

For third-party OAuth providers (GitHub, Twitter, etc.):

```js
const redirectUrl = chrome.identity.getRedirectURL();
// Returns: https://<extension-id>.chromiumapp.org/

const authUrl = `https://github.com/login/oauth/authorize?client_id=XXX&redirect_uri=${redirectUrl}`;

const responseUrl = await chrome.identity.launchWebAuthFlow({
  url: authUrl,
  interactive: true
});

// Parse the token from responseUrl
const url = new URL(responseUrl);
const code = url.searchParams.get('code');
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/skills-src/chrome-extensions/references/extensions/auth-identity.md#L91-L141). [Upstream licensing terms](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/README.md#license). Reorganized for this edition.
