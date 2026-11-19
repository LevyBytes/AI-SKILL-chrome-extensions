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

#### Code Examples:

**Privacy-Preserving Social Sharing (HTML)**
```html
<!-- No JS SDK required -->
<a href="https://x.com/intent/tweet?text=Check%20this%20out&url=https%3A%2F%2Fexample.com" 
   rel="noopener" target="_blank">
   Share on X
</a>
```

**Video Façade Pattern (HTML/JS)**
```html
<div id="video-container" data-video-id="abc123">
  <img src="https://img.youtube.com/vi/abc123/maxresdefault.jpg" alt="Play Video" id="play-btn">
</div>

<script>
document.getElementById('play-btn').addEventListener('click', function() {
  const container = document.getElementById('video-container');
  const videoId = container.dataset.videoId;
  container.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1" allowfullscreen></iframe>`;
});
</script>
```

**FedCM Sign-In (JavaScript)**
```javascript
try {
  const credential = await navigator.credentials.get({
    identity: {
      providers: [{
        configURL: "https://idp.example/fedcm.json",
        clientId: "rp-client-id-123",
        nonce: "a_secure_random_nonce_value"
      }]
    }
  });
  authenticateWithBackend(credential.token);
} catch (error) {
  // Handle FedCM login failure
}
```

### 5. Privacy-Preserving Headers

Use standard HTTP headers to instruct the browser to enforce privacy boundaries.

#### DOs:
*   **DO** use `Permissions-Policy` to disable powerful features (like camera, microphone, geolocation) by default, enabling them only where required.
*   **DO** set a strict `Referrer-Policy` to prevent leaking sensitive URL parameters to third parties.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/privacy/privacy.md#L97-L185). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
