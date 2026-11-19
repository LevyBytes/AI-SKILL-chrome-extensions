    *   Signal API calls perform passive background synchronization and MUST NOT break the UI or emit `console.error` when synchronization fails. Wrap Signal API calls in `try...catch` and log failures with `console.warn` instead of `console.error` so passive sync issues do not trigger Lighthouse Best Practices failures (`errors-in-console`) on page load.

```javascript
// Client-side management synchronization ES module
import { listFetch, renameCredentialFetch, updateUserFetch, deleteFetch } from './api.js';

// Valid unpadded Base64URL: non-empty, [A-Za-z0-9_-] only, no '=' padding, length % 4 !== 1
function isValidBase64Url(value) {
  return typeof value === 'string' &&
    value.length > 0 &&
    value.length % 4 !== 1 &&
    /^[A-Za-z0-9_-]+$/.test(value);
}

async function syncAcceptedCredentials(rpId, userId, currentCredentialsList) {
  if (!window.PublicKeyCredential || !PublicKeyCredential.signalAllAcceptedCredentials) return;
  const credentialIds = currentCredentialsList.map(c => c.id); // Array of Base64URL credential ID strings
  if (!rpId || !isValidBase64Url(userId) || !credentialIds.every(isValidBase64Url)) {
    console.warn('SignalAllAcceptedCredentials skipped: server rpId and valid unpadded Base64URL userId and credential IDs are required.');
    return;
  }

  try {
    await PublicKeyCredential.signalAllAcceptedCredentials({
      rpId, // Always use the server-provided rpId; DO NOT use window.location.hostname
      userId, // Base64URL-encoded user ID from the server
      allAcceptedCredentialIds: credentialIds
    });
  } catch (e) {
    // Use console.warn instead of console.error so passive sync failures do not fail Lighthouse errors-in-console
    console.warn('SignalAllAcceptedCredentials sync warning:', e);
  }
}

async function loadManagementPanel() {
  const response = await listFetch();
  const { rpId, userId, credentials } = await response.json();
  
  renderUI(credentials);
  // Sync accepted credentials on initial load using server-provided rpId and userId
  await syncAcceptedCredentials(rpId, userId, credentials);
}

async function performDelete(credentialId) {
  const response = await deleteFetch(credentialId);
  if (response.ok) {
    const updatedResponse = await listFetch();
    const { rpId, userId, credentials } = await updatedResponse.json();
    
    renderUI(credentials);
    // Sync remaining accepted credentials after deletion
    await syncAcceptedCredentials(rpId, userId, credentials);
  }
}

// Renaming a passkey's nickname updates the server record only
async function performCredentialRename(credentialId, newCredentialName) {
  const response = await renameCredentialFetch(credentialId, { name: newCredentialName });
  if (response.ok) {
    const updatedResponse = await listFetch();
    const { credentials } = await updatedResponse.json();
    renderUI(credentials);
  }
}

// Renaming the user's account username or displayName triggers signalCurrentUserDetails
async function performUserRename(updatedName, updatedDisplayName) {
  const response = await updateUserFetch({ name: updatedName, displayName: updatedDisplayName });
  if (response.ok && window.PublicKeyCredential && PublicKeyCredential.signalCurrentUserDetails) {
    const { rpId, userId } = await response.json();
    if (!rpId || !isValidBase64Url(userId)) {
      console.warn('SignalCurrentUserDetails skipped: server rpId and valid unpadded Base64URL userId are required.');
      return;
    }
    try {
      await PublicKeyCredential.signalCurrentUserDetails({
        rpId, // Always use the server-provided rpId; DO NOT use window.location.hostname
        userId, // Base64URL-encoded user ID from the server
        name: updatedName, // Updated username
        displayName: updatedDisplayName // Updated display name
      });
    } catch (e) {
      // Use console.warn instead of console.error for passive background sync
      console.warn('SignalCurrentUserDetails sync warning:', e);
    }
  }
}

window.addEventListener('DOMContentLoaded', loadManagementPanel);
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/security/passkey-management.md#L97-L187). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
