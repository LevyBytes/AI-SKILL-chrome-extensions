### 4. Delegate Access to Cross-Origin Iframes via `Permissions-Policy`

By default, `local-network` and `loopback-network` have a default allowlist of `'self'`, blocking cross-origin `<iframe>` embeds from making local or loopback requests. To allow an embedded cross-origin `<iframe>` (such as a hardware setup widget or an SSO frame that communicates with a local agent) to initiate local or loopback requests, explicitly delegate the granular permissions in the `allow` attribute and/or HTTP `Permissions-Policy` header:

```html
<!-- Delegate granular local-network and loopback-network permissions to the embedded iframe -->
<iframe
  src="https://setup.partner.example.com/device-bridge"
  allow="local-network; loopback-network"
  title="Local Device Bridge">
</iframe>
```

Send the `Permissions-Policy` header on the **top-level (embedding) document's** response, not on the iframe's response:

```http
Permissions-Policy: local-network=(self "https://setup.partner.example.com"), loopback-network=(self "https://setup.partner.example.com")
```

## Fallback Strategies

Browser support for Local network access: Limited availability.
Supported by: Chrome 145 (Feb 2026) and Edge 145 (Feb 2026).
Unsupported in: Firefox and Safari.

If your Baseline target does not support Local Network Access permissions and `targetAddressSpace` options, implement **feature detection with progressive fallback**:

1. **Permission Query Fallback**: Wrap `navigator.permissions.query({ name: permissionName })` in a `try / catch`. If the browser throws a `TypeError` because `'local-network'` or `'loopback-network'` is an unrecognized `PermissionName`, treat the state as `'prompt'` so the request still runs on an explicit user click (the connection attempt itself triggers the browser prompt where LNA is supported).
2. **DO NOT** query the legacy combined permission name `{ name: 'local-network-access' }`. In older Chrome versions this query crashes the renderer process, and `try / catch` cannot prevent it. Newer Chrome versions treat `'local-network-access'` only as a legacy alias for the granular permissions.
3. **Graceful Rejection Handling**: Always wrap `fetch()`, `WebSocket` error events, and `transport.ready` in error handlers that catch `TypeError` / connection failures and present clear remediation steps (checking that the local device is powered on, connected to the same network, and allowed in browser permissions).

```javascript
/**
 * Cross-browser permission check for the granular LNA permissions.
 * Never falls back to querying 'local-network-access', which crashes older Chrome versions.
 * @param {'local-network' | 'loopback-network'} permissionName
 */
export async function queryLnaPermissionSafe(permissionName) {
  if (!navigator.permissions?.query) {
    return 'prompt';
  }
  try {
    const status = await navigator.permissions.query({ name: permissionName });
    return status.state;
  } catch {
    // Unrecognized permission name; proceed on user gesture
    return 'prompt';
  }
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/security/local-network-access.md#L143-L192). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
