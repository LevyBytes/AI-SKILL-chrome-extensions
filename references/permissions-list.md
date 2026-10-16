# Permissions List

> Manifest V3 API examples are fragments: run awaited calls inside an async handler and supply the shown input variables. Register worker listeners synchronously at startup; each API heading links to its official contract. Each value is shown in backticks so an agent can confirm a string exists and is spelled correctly.

## Overview
Named permission strings grouped by area. Not every permission is eligible for optional_permissions; check the restrictions in [Downloads, management and permissions](api-downloads-management-permissions.md). These are the exact strings; host access is declared separately.

## Named permissions vs host permissions
- **Named permissions** (this page) are fixed strings in `permissions` / `optional_permissions`; each unlocks a specific `chrome.*` API or capability.
- **Host permissions** are URL match patterns in `host_permissions` / `optional_host_permissions` — not on this list. The wildcard token `<all_urls>` matches every URL the extension can access and is a host match pattern, not a named permission.
- Some strings still pair with host access (e.g. `declarativeNetRequestWithHostAccess` only acts on granted hosts).
- Many permissions trigger a user-facing install warning (typically those reading browsing data, websites, or device state); many API-only permissions (e.g. `alarms`, `storage`) show none. Consult the official permissions-list page for the exact warning text.

## Tabs, navigation, and pages
`activeTab`, `tabs`, `tabGroups`, `tabCapture`, `pageCapture`, `topSites`, `webNavigation`, `sessions`, `favicon`, `sidePanel`

## Scripting and content
`scripting`, `declarativeContent`, `userScripts`, `contextMenus`

## Network requests
`declarativeNetRequest`, `declarativeNetRequestWithHostAccess`, `declarativeNetRequestFeedback`, `webRequest`, `webRequestBlocking`, `webRequestAuthProvider`, `proxy`, `webAuthenticationProxy`, `dns`

## Storage and data
`storage`, `unlimitedStorage`, `cookies`, `browsingData`, `history`, `readingList`, `bookmarks`, `downloads`, `downloads.open`, `downloads.ui`, `downloads.shelf`

## Clipboard and capture
`clipboardRead`, `clipboardWrite`, `desktopCapture`, `audio`, `documentScan`

## Identity, messaging, and runtime
`identity`, `identity.email`, `gcm`, `nativeMessaging`, `offscreen`, `background`

## Browser configuration and privacy
`accessibilityFeatures.read`, `accessibilityFeatures.modify`, `contentSettings`, `privacy`, `fontSettings`, `management`, `debugger`, `processes`, `idle`, `power`, `alarms`, `notifications`, `geolocation`, `search`

## Text-to-speech
`tts`, `ttsEngine`

## System info
`system.cpu`, `system.display`, `system.memory`, `system.storage`, `systemLog`

## Certificates and keys
`certificateProvider`, `platformKeys`

## ChromeOS / enterprise / device
`fileBrowserHandler`, `fileSystemProvider`, `loginState`, `printerProvider`, `printing`, `printingMetrics`, `vpnProvider`, `wallpaper`, `enterprise.deviceAttributes`, `enterprise.hardwarePlatform`, `enterprise.login`, `enterprise.networkingAttributes`, `enterprise.platformKeys`
