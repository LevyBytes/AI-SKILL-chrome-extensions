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


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/privacy/privacy/guide.md#L144-L220). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
