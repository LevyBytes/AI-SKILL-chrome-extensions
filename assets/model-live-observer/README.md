# Live Research Observer

This generated development package lets an owner browse one approved origin manually in one exact Chrome tab while a local bridge records bounded DOM evidence and complete configured GraphQL exchanges.

The extension observes owner activity and network evidence.
It never clicks, scrolls, navigates, submits, or accepts page control commands.

## Run

1. Start the bridge from this directory: `node bridge/live-observer-bridge.mjs --output-root live`.
2. Load `extension` as an unpacked extension in Chrome developer mode.
3. Open an allowed origin, select the extension, then select **Start live research**. The extension connects to the configured local bridge automatically.
4. Accept Chrome's visible debugging indicator while the session is active.
5. Browse manually in that exact tab and trigger the configured GraphQL requests.
6. Use **Observe now** for a DOM checkpoint and **Stop** for a final snapshot, debugger detach, and terminal bridge record.
7. Validate the completed session: `node bridge/validate-live-session.mjs --session <session-directory>`.

The bridge does not print or request a connection token.
An internal ephemeral session secret is returned only to the pinned extension origin, retained in bridge process memory and trusted `chrome.storage.session`, and never written into evidence.

## Sensitive evidence boundary

Configured GraphQL evidence includes the full request URL, method, query text, variable values, extensions, request body, non cookie request headers, response status and timing, non cookie response headers, and response body.
`Cookie` and `Set-Cookie` headers are excluded and browser cookie storage is never queried.
Other retained headers and bodies can contain reusable tokens, private account data, and personal information.
Keep the generated package and its `live/` directory in the authorized private workspace.

Request body, response body, pending request, and session body limits are explicit configuration.
Evidence inside those limits is retained verbatim and hashed.
Unavailable or over limit bodies are marked incomplete, and the bridge will not claim transport readiness.

DOM evidence remains sanitized separately.
It records bounded top frame structure and text, normalized same origin links, viewport state, and trusted click or change descriptors.
It excludes form values, editable contents, active content, browser storage, clipboard data, keystrokes, and credential shaped DOM values.

Validator success proves deterministic transport and evidence integrity, not that every application path or request was exercised.
