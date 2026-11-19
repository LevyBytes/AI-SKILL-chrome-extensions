#### Code Examples:

**Strict Referrer Policy (HTTP)**
```http
Referrer-Policy: strict-origin-when-cross-origin
```

**Defensive Permissions Policy (HTTP)**
Disables powerful features for all origins by default.
```http
Permissions-Policy: geolocation=(), camera=(), microphone=(), accelerometer=()
```

### 6. Fingerprinting and User-Agent Reduction

Avoid techniques that attempt to uniquely identify users covertly based on their device configuration. Fingerprinting takes away user control because it relies on unchanging characteristics and happens invisibly, preventing users from opting out or clearing their identifier.

#### DOs:
*   **DO** use **Feature Detection** instead of User-Agent sniffing to determine if a browser supports a capability.
*   **DO** use **User-Agent Client Hints** (UA-CH) if supported by the browser, when specific device targeting is required.

#### DON'Ts:
*   **DON'T** use canvas rendering, font lists, or audio/video device enumerations to build a device fingerprint.
*   **DON'T** rely on the full granularity of the traditional `navigator.userAgent` string.

#### Code Examples:

**Feature Detection (JavaScript)**
```javascript
// GOOD: Check if the API exists
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(...);
} else {
  // Fallback
}

// BAD: Sniffing UA
// if (navigator.userAgent.includes("Chrome/100")) ...
```

**User-Agent Client Hints (JavaScript)**
```javascript
if (navigator.userAgentData) {
  navigator.userAgentData.getHighEntropyValues(["platformVersion", "architecture"])
    .then(ua => {
      console.log(ua.platformVersion);
    });
}
```

### 7. Data Rights and User Control

Empower users to exercise their rights over their personal data.

#### DOs:
*   **DO** provide clear mechanisms for users to **access** all data you have collected about them.
*   **DO** implement automated or easy manual flows for **data deletion** (erasure).
*   **DO** allow users to correct inaccurate information associated with their identity.

#### DON'Ts:
*   **DON'T** make the deletion process difficult or require users to contact support if sign-up was automated.
*   **DON'T** retaliate against users who exercise their data rights by denying access to non-dependent services.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/privacy/privacy.md#L186-L247). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
