### 2. Declare `targetAddressSpace` in `fetch()` and `Request`

When an `https://` page requests an `http://` endpoint on the local network or loopback interface, specify `targetAddressSpace: 'local'` or `targetAddressSpace: 'loopback'` in the `fetch()` or `Request` options.

Explicitly setting `targetAddressSpace` does two critical things:
1. **Mixed Content Exemption**: Mixed Content checks run *before* DNS resolution. Declaring `targetAddressSpace: 'local'` (or `'loopback'`) informs the browser ahead of DNS resolution that an `http://` URL (including a custom DNS hostname that resolves to a local IP) targets a local/loopback endpoint and should be exempted from Mixed Content blocking once the user grants the permission.
2. **Address Space Verification**: After DNS resolution, the browser verifies that the resolved IP address actually belongs to the declared `targetAddressSpace`. If a hostname with `targetAddressSpace: 'local'` unexpectedly resolves to a `public` IP address, the browser immediately aborts the request with a `TypeError` network error.

```javascript
/**
 * Connects to a local network device (e.g., LAN printer or IoT hub) over HTTP.
 * Example endpoint URL is illustrative; replace with your device's address.
 */
export async function fetchLocalDeviceStatus(deviceUrl = 'http://192.168.1.100:8080/api/status') {
  const request = new Request(deviceUrl, {
    method: 'GET',
    mode: 'cors',
    // MANDATORY: Declare 'local' when targeting RFC 1918 / .local LAN addresses
    targetAddressSpace: 'local',
  });

  const response = await fetch(request);
  if (!response.ok) {
    throw new Error(`Device responded with HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Connects to a local companion daemon running on the user's loopback interface.
 * Example loopback port is illustrative; replace with your service's port.
 */
export async function fetchLoopbackDaemon(daemonUrl = 'http://127.0.0.1:45678/health') {
  const request = new Request(daemonUrl, {
    method: 'GET',
    mode: 'cors',
    // MANDATORY: Declare 'loopback' when targeting 127.0.0.1, [::1], or localhost
    targetAddressSpace: 'loopback',
  });

  const response = await fetch(request);
  if (!response.ok) {
    throw new Error(`Companion app responded with HTTP ${response.status}`);
  }
  return response.json();
}
```

### 3. Real-Time Connections with `WebSocket` and `WebTransport`

Local Network Access restrictions also govern `WebSocket` and `WebTransport` connections:

- **`WebSocket`**: The `WebSocket(url, protocols)` constructor only accepts a subprotocol string or array as its second argument—do **not** pass a `{ targetAddressSpace }` options object, which throws a `SyntaxError`. Instead, the browser inspects the `WebSocket` URL before DNS resolution: `ws://` connections initiated from an `https://` page are exempted from Mixed Content blocking when the URL host is syntactically recognizable as local or loopback—specifically a private or loopback IP literal (`ws://192.168.1.100:8080`, `ws://127.0.0.1:8080`, `ws://[::1]:8080`), `localhost` (`*.localhost`), or a `.local` mDNS hostname (`ws://device.local:8080`)—and gated behind the `local-network` or `loopback-network` permission prompt. If a local endpoint is addressed via a custom non-`.local` DNS hostname, connect over `wss://`.
- **`WebTransport`**: Because `WebTransport` strictly requires `https://` (HTTP/3 over QUIC with TLS or `serverCertificateHashes` for local self-signed certificates), it never triggers Mixed Content blocks and does not accept a `targetAddressSpace` option. Instead, the browser automatically verifies the resolved IP address space and gates the `transport.ready` promise behind the `local-network` or `loopback-network` permission prompt.

```javascript
/**
 * Opens a WebSocket connection to a local network device (IP literal, .local, or localhost).
 */
export function openLocalWebSocket(wsUrl = 'ws://192.168.1.100:8080/stream') {
  // Pass only subprotocol string(s) as the second argument (never an options object).
  // Browsers exempt ws:// from Mixed Content when the host is a local/loopback IP literal,
  // .local, or localhost, and gate the connection on 'local-network' or 'loopback-network'.
  const socket = new WebSocket(wsUrl, ['v1.telemetry']);
  return socket;
}

/**
 * Opens a WebTransport session to a local network endpoint using a pinned self-signed certificate hash.
 */
export async function openLocalWebTransport(wtUrl = 'https://192.168.1.100:4433/wt', certSha256Bytes) {
  const transport = new WebTransport(wtUrl, {
    serverCertificateHashes: [
      {
        algorithm: 'sha-256',
        value: certSha256Bytes,
      },
    ],
  });

  // transport.ready resolves only after the user grants the 'local-network' permission
  // and rejects with WebTransportError if the permission is denied.
  await transport.ready;
  return transport;
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/security/local-network-access.md#L56-L142). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
