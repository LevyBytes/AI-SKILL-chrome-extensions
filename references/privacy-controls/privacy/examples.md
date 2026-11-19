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
 
#### DOs:
*   **DO** scrub Personally Identifiable Information (PII) from application logs. Use automated masking for emails, tokens, and IDs.
*   **DO** use `HttpOnly` flags for cookies storing session identifiers to prevent other scripts from accessing them.
*   **DO** implement rate limiting on sensitive endpoints (e.g., user search or profile views) to prevent bulk data scraping.
*   **DO** use **CHIPS (Cookies Having Independent Partitioned State)** by appending the `Partitioned` attribute for 1:1 embeds that do not share state across top-level sites.
 
#### DON'Ts:
*   **DON'T** store sensitive tokens or PII in `localStorage`, as it is accessible by any embedded script.
*   **DON'T** rely on unpartitioned `SameSite=None` cookies.
 
#### Code Examples:
 
**Secure Session Cookie (HTTP)**
```http
Set-Cookie: session_id=xyz123; Secure; HttpOnly; SameSite=Lax
```

**CHIPS Cookie (HTTP)**
```http
Set-Cookie: theme_pref=dark; SameSite=None; Secure; Path=/; Partitioned; HttpOnly
```

### 4. Third-Party Audits and Mitigations

Third-party scripts and resources are a common source of privacy leaks. You are responsible for the third parties you bring into your application.

#### DOs:
*   **DO** conduct regular technical audits of network requests using DevTools or HAR files to identify what data third parties are collecting.
*   **DO** use the **Façade Pattern** for heavy embeds (like YouTube or TikTok). Display a static thumbnail and load the interactive iframe only after the user clicks.
*   **DO** use privacy-preserving options for embeds when available (e.g., `youtube-nocookie.com`).
*   **DO** replace heavy social sharing SDKs with simple, static HTML links that do not track users.
*   **DO** use the **Federated Credential Management API (FedCM)** to mediate "Sign-In" flows natively, preventing IdP tracking of Relying Parties prior to user consent.

#### DON'Ts:
*   **DON'T** assume a third party is privacy-safe just because it is popular.
*   **DON'T** load third-party scripts on pages where sensitive data (like checkout or health info) is handled unless strictly necessary.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/privacy/privacy/guide.md#L71-L143). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
