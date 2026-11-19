- The application queries the granular permission (`'local-network'` or `'loopback-network'`) via `navigator.permissions.query()` with fallback error handling when the permission name is unrecognized.
- The application never queries the legacy `'local-network-access'` permission name via `navigator.permissions.query()`.
- Requests targeting a local network endpoint specify `targetAddressSpace: 'local'` in `fetch()` or `Request` options, and requests targeting a loopback endpoint specify `targetAddressSpace: 'loopback'`.
- When the permission state is `'prompt'`, local network or loopback requests are not fired automatically on page load and are instead triggered by an explicit user interaction (such as clicking a button).
- When a local network or loopback request is denied or fails to connect, the application catches the error without unhandled promise rejections and reveals visible error or remediation feedback in the UI.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/local-network-access/expectations.md#L1-L5). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
