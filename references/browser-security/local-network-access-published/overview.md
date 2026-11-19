# Local Network Access

When a web application served from a `public` origin (or an intranet `local` origin) connects to a user's private local network (such as a LAN printer, IoT hub, or router at `192.168.1.x` or `device.local`) or to a local companion service running on the user's machine (`127.0.0.1`, `[::1]`, or `localhost`), browsers gate the connection behind a **Local Network Access (LNA)** permission prompt.

Local Network Access splits access into two granular permissions and `Permissions-Policy` tokens based on the IP address space lattice (`public` → `local` → `loopback`), enforcing checks **only** when a request crosses from a *less private* address space into a *more private* address space:
- **`local-network`**: Required when connecting from a `public` origin to the `local` address space (RFC 1918 private IPv4 ranges `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, link-local `169.254.0.0/16` / `fe80::/10`, IPv6 Unique Local Addresses `fc00::/7`, and `.local` mDNS hostnames).
- **`loopback-network`**: Required when connecting from a `public` or `local` origin to the `loopback` address space (`127.0.0.0/8`, `::1/128`, or `localhost`).

Because `localhost` (`127.0.0.1` and `[::1]`) is already in the most private (`loopback`) address space, serving your web app from `http://localhost` during local development will **not** trigger LNA checks by default. To test LNA prompts and permission states locally without deploying to a public server, either override your local dev server's IPv4 and IPv6 address space to `public` using the `--ip-address-space-overrides=127.0.0.1:8080=public,[::1]:8080=public` Chromium flag, or manually toggle **Local network** and **Loopback network** between `Ask`, `Allow`, and `Block` in browser **Site settings**.

**MANDATORY:** Serve any web application that initiates local or loopback network requests from a **Secure Context (`https://`)**. Local Network Access permissions are denied automatically in insecure (`http://`) top-level contexts.

**DO NOT** rely on deprecated Private Network Access (PNA) preflight headers (`Access-Control-Request-Private-Network: true` / `Access-Control-Allow-Private-Network: true`). Local Network Access enforces access via client-side user permission prompts (`local-network` and `loopback-network`) combined with standard CORS headers (`Access-Control-Allow-Origin`) when reading cross-origin responses. PNA preflights were never enforced as a blocking requirement and are not needed as a fallback. Existing servers or device firmware that already return `Access-Control-Allow-Private-Network: true` can keep doing so harmlessly, but do not add PNA handling to new code.

## Implementation Steps

### 1. Pre-Check Granular Permission State and Gate on User Gesture

Never fire local network or loopback requests unconditionally on page load (`DOMContentLoaded`) when the permission state is `'prompt'`, and never initiate the first permission-triggering request from a **Service Worker** or **Shared Worker** (which lack an attached `Document` and will immediately fail if permission is not already `'granted'`).

Instead, query `navigator.permissions.query()` for `'local-network'` or `'loopback-network'` first:
- If `state === 'granted'`, connect automatically.
- If `state === 'prompt'`, display clear UI explaining why the app needs access to the local device or companion app, and trigger the request from an explicit user gesture (such as a button click).
- If `state === 'denied'`, render actionable remediation UI instructing the user how to re-enable Local Network or Loopback access in browser site settings.

```javascript
/**
 * Queries the granular Local Network Access permission for the target space.
 * @param {'local-network' | 'loopback-network'} permissionName
 */
export async function checkNetworkPermission(permissionName) {
  const status = await navigator.permissions.query({ name: permissionName });

  // Keep UI synchronized if the user changes permission in browser site settings
  status.addEventListener('change', () => {
    updatePermissionUI(permissionName, status.state);
  });

  updatePermissionUI(permissionName, status.state);
  return status.state;
}

function updatePermissionUI(permissionName, state) {
  const statusBadge = document.querySelector(`[data-permission-status="${permissionName}"]`);
  const remediationBox = document.querySelector(`[data-remediation="${permissionName}"]`);
  if (statusBadge) {
    statusBadge.textContent = state;
  }
  if (remediationBox) {
    // Show remediation instructions whenever permission is explicitly denied
    remediationBox.hidden = state !== 'denied';
  }
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/security/local-network-access.md#L1-L55). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
