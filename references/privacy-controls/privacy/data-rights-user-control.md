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

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/privacy/privacy/guide.md#L221-L257). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
