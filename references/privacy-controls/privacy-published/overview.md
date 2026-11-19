# Web Privacy Guidelines for Developers

Web application developers must treat privacy as a foundational architectural requirement, not just a legal compliance checkbox. As the web ecosystem shifts away from passive tracking toward explicit, user-consented interactions, building privacy-preserving applications is critical for user trust and security.

This document provides high-level principles and detailed, actionable guidelines with code examples for web developers.

## High-Level Overview

These core themes should guide your approach to privacy in web development:

1.  **Automation Asymmetry & Privacy Labor**: Do not offload the burden of protecting privacy to the user (privacy labor). Avoid overwhelming users with complex consent dialogs (automation asymmetry). Users have limited time and attention; offloading privacy choices to them is often ineffective and causes fatigue. Systems should be privacy-protective by default.
2.  **Data Minimization**: "If you don't have the data, you can't lose it." Collect only the bare minimum required for the immediate task. Reducing data storage reduces the risk of breach and builds user trust.
3.  **Purpose Limitation**: Data collected for one purpose must not be used for another without fresh consent. Repurposing data without explicit agreement violates the trust relationship with the user.
4.  **Transparency by Default**: Be honest and clear about why data is collected, where it goes, and how long it is kept. Transparency builds trust and can be a unique selling point for your application.
5.  **Trustworthy Agency**: Treat your application as an agent acting in the user's best interest. This means protecting them from intrusive behaviors, unnecessary data exposure, and acting as a loyal fiduciary to the user rather than serving third-party interests.

## Detailed Guidelines

### 1. Data Minimization and Purpose Limitation

Reducing the amount of data collected and strictly limiting its use is the most effective way to protect user privacy.

#### DOs:
*   **DO** collect data at the lowest granularity necessary. If you only need to know if a user is in a certain age bracket (e.g., 18-34), ask for the bracket, not the exact date of birth.
*   **DO** provide guest checkout options for e-commerce to avoid forced account creation, which reduces data collection and cart abandonment.
*   **DO** delete data as soon as the purpose for its collection has been fulfilled.
*   **DO** use techniques like "fuzzing" or adding noise to data (Differential Privacy) when gathering aggregate statistics.

#### DON'Ts:
*   **DON'T** collect data speculatively "just in case" it might be useful in the future.
*   **DON'T** reuse data collected for one purpose (e.g., security verification) for another (e.g., marketing) without explicit user consent.

#### Code Examples:

**Fuzzing Data Collection (HTML/JS)**
Instead of asking for exact age:
```html
<label for="age-bracket">Age Bracket:</label>
<select id="age-bracket" name="age-bracket">
  <option value="18-34">18-34</option>
  <option value="35-49">35-49</option>
  <option value="50+">50+</option>
</select>
```

### 2. Transparency and Trust

Build trust by being open about your data practices and providing easy ways for users to control their data.

#### DOs:
*   **DO** provide inline explanations for why data is requested. Place the explanation directly next to the input field.
*   **DO** provide a clear reason and context *before* requesting powerful browser permissions (e.g., camera, location).
*   **DO** consider using the **Page Embedded Permission Control (PEPC)** `<permission>` element, if supported, to make permission requests declarative, user-initiated, and act as data mediators.
*   **DO** use the `Clear-Site-Data` header when a user logs out to ensure no lingering data remains in the browser.
*   **DO** make it as easy to opt-out or delete an account as it was to sign up.

#### DON'Ts:
*   **DON'T** bury data collection explanations in long, complex privacy policies.
*   **DON'T** use deceptive patterns (dark patterns) to trick users into giving consent.

#### Code Examples:

**Inline Transparency (HTML)**
```html
<div>
  <label for="phone">Phone Number (Optional)</label>
  <input id="phone" type="tel" name="phone">
  <a href="#phone-help">Why do we ask for this?</a>
  <aside id="phone-help">
    We only use your phone number to send two-factor authentication codes for account security.
  </aside>
</div>
```

**Clear-Site-Data on Logout (HTTP Response)**
```http
HTTP/1.1 200 OK
Clear-Site-Data: "*"
```
*Note: If clearing the cache, avoid sending this on the main navigation page to prevent blocking UI rendering on slow devices; trigger it via a subresource.*

**Page Embedded Permission Control (HTML)**
```html
<!-- Declarative permission element with fallback -->
<permission type="geolocation" onpromptdismiss="updateMap()">
  <!-- Fallback for unsupported browsers -->
  <button onclick="navigator.geolocation.getCurrentPosition(updateMap)">
    Use my location
  </button>
</permission>
```

### 3. Security and Data Handling for Privacy
 
Privacy relies on a foundation of secure coding. Vulnerabilities in the application or insecure storage directly lead to privacy violations.
 

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/privacy/privacy.md#L1-L96). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
