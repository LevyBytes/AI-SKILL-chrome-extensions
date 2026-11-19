```yaml
---
name: passkey-management
description: Let users view and manage the passkeys registered to their account.
web-feature-ids:
  - webauthn
  - webauthn-signals
---
```

# Passkey Management

This guide details how to enable users to view, rename, and delete their registered passkeys while keeping saved credentials and user profile details synchronized between the server and the user's password managers using the Signal API.

## Server-Side Operations

Your backend database layer and endpoints MUST support common CRUD actions for registered credentials as well as updating user profile details. Decoupled from framework-specific libraries, the server exposes endpoints to:

1.  **List all user credentials**: Fetch all `StoredPasskeyCredential` records matching the signed-in user's ID, and return them alongside the server's configured `rpId` and the user's `passkeyUserId` so the client never has to guess `rpId` from `window.location.hostname`. Ensure every credential `id` and user `passkeyUserId` is stored and returned as a valid unpadded Base64URL string (`[A-Za-z0-9_-]`, no `=` padding, and `length % 4 !== 1`)—including in prototype seed data and mock backends (for example, `Buffer.from('cred-1').toString('base64url')` or `'dGVzdC1jcmVkLTE'`, never arbitrary human-readable placeholders like `'passkey-1'` or `'cred_yubikey_01'`).
2.  **Update credential names**: Accept a new custom nickname for a specific credential ID and persist the update on the server.
3.  **Delete credentials**: Remove a specific credential ID from the database.
4.  **Update user account details**: Accept updated `name` (username) and `displayName` values for the signed-in user's profile and return the updated user profile alongside the server's `rpId` and Base64URL `passkeyUserId` so the client can synchronize them with the passkey provider.

```javascript
// Node.js routing example for credential CRUD and user profile rename
const RP_ID = 'example.com'; // Predefined server RP ID (example value; must match registration rp.id)

router.get('/api/credentials', checkUserAuthenticated, async (req, res) => {
  const credentials = await db.findCredentialsByUserId(req.user.id);
  return res.json({
    rpId: RP_ID,
    userId: req.user.passkeyUserId, // Valid unpadded Base64URL string
    credentials,
  });
});

router.put('/api/credential/:id', checkUserAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const cred = await db.findCredentialById(id);
  if (!cred || cred.passkeyUserId !== req.user.id) {
    return res.status(404).json({ error: 'Credential not found.' });
  }
  cred.name = name;
  await db.saveCredential(cred);
  return res.json(cred);
});

router.delete('/api/credential/:id', checkUserAuthenticated, async (req, res) => {
  const { id } = req.params;
  const cred = await db.findCredentialById(id);
  if (!cred || cred.passkeyUserId !== req.user.id) {
    return res.status(404).json({ error: 'Credential not found.' });
  }
  await db.deleteCredential(id);
  return res.json({ success: true });
});

router.put('/api/user', checkUserAuthenticated, async (req, res) => {
  const { name, displayName } = req.body;
  const updatedUser = await db.updateUser(req.user.id, { name, displayName });
  return res.json({
    ...updatedUser,
    rpId: RP_ID,
    userId: updatedUser.passkeyUserId,
  });
});
```

## Client-Side Management UI

Render a dedicated settings panel allowing users to easily audit and manage their registered authentication options and account profile details:

1.  **Display saved list**: Fetch list from your endpoint and render individual credential rows. If the response is empty, render a helpful empty-state message (e.g., "No passkeys found").
2.  **Map AAGUID Metadata**: For each passkey, lookup its `aaguid` property against your local registry to render its provider details. See [Determine the passkey provider from AAGUID](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/passkey-management/guide.md#aaguid) section for more details.
3.  **Per-Item UI Requirements**: Every row inside the list container MUST render:
    *   **Provider Icon**: AAGUID-derived image or data URI.
    *   **Provider/Custom Name**: AAGUID-derived name or user-renamed string.
    *   **Registration Date**: The database-persisted raw epoch timestamp `registeredAt` formatted to a human-readable date for client display.
    *   **Last Used Date**: The database-persisted raw epoch timestamp `lastUsedAt` formatted to a human-readable date (if present) for client display.
    *   **Rename Button**: Triggers a rename action to update the credential's custom nickname on the server (`PUT /api/credential/:id`). Note: Renaming an individual passkey's nickname is a server-side label change and does NOT invoke `signalCurrentUserDetails()`.
    *   **Delete Button**: Triggers deletion of the credential (`DELETE /api/credential/:id`) and synchronizes the remaining credential IDs via `signalAllAcceptedCredentials()`.
4.  **User Account Rename UI**:
    *   Provide a control allowing the user to update their account username (`name`) or `displayName` (`PUT /api/user`), and immediately synchronize the updated user details with the password manager via `PublicKeyCredential.signalCurrentUserDetails()`.
5.  **Conditional "Create Passkey" Button**:
    *   Offer a prominent "Create passkey" registration trigger button on the management page. Before rendering this UI element, the page MUST feature-detect capabilities using `PublicKeyCredential.getClientCapabilities()` to verify platform authenticator is supported. If passkeys are unsupported, hide this button and gracefully encourage standard MFA enrollments instead.
    *   Allow registering a security key by omitting `authenticatorSelection.authenticatorAttachment` on `navigator.credentials.create()` call.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/security/passkey-management/guide.md#L1-L86). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
