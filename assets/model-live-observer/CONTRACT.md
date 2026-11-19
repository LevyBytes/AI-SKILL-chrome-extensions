# Live research observer contract

## Authority

The owner starts observation from the extension popup while an allowed origin is active.
Start pins the tab ID, window ID, exact origin, and extension session UUID, then connects automatically to the configured loopback port.
When configured development network capture is enabled, Start also attaches Chrome's debugger to that exact tab and enables the CDP Network domain with explicit buffer bounds.
Chrome displays its active debugging indicator.

Navigation within the pinned origin may reinject the DOM observer.
Navigation to another origin aborts even when that origin is separately eligible for a future session.
Tab closure or replacement, unexpected debugger detach, failed reinjection, bridge loss, invalid evidence, or persistence failure also aborts.
No subframe, other tab, other extension, page script, or bridge response may submit page control commands or act for the owner.

## DOM observation

The extension observes owner driven browsing only.
It captures bounded sanitized top frame DOM text and structure, normalized same origin links, viewport state, and trusted click or change descriptors.
DOM content is labelled `untrusted-page-content` and is data, never instruction authority.

The traversal stops at byte, node, attribute, and depth limits without cloning the page first.
It removes active and embedded content, form controls, editable regions, comments, credential shaped text, event handlers, style, source URLs, cross origin links, form values, and sensitive data attributes.
Query values are blank by default and retained only when the generated policy names the exact key and full match pattern.

## Development network evidence

Network evidence is enabled only by explicit generated configuration and only for exact GraphQL endpoint paths on the pinned origin.
The debugger is attached only to the pinned tab.
The extension uses `Network.enable`, `Network.getRequestPostData`, `Network.getResponseBody`, and `Network.disable`; it does not issue navigation, input, runtime evaluation, replay, cookie, storage, or interception commands.

A request record retains the full request URL, method, resource type, operation names, request body, and non cookie request headers.
A response record retains the response URL, status, status text, MIME type, protocol, cache and service worker flags, timing, encoded length, response body, and non cookie response headers.
The request body contains GraphQL query text, variable values, and extensions exactly as sent when Chrome provides it within the configured limit.

`Cookie` and `Set-Cookie` headers are removed before evidence construction.
The extension never calls browser cookie storage APIs.
Other retained headers and bodies are explicitly sensitive and can contain reusable tokens or private data.

Each body records its UTF 8 representation byte length, SHA 256 hash, base64 flag, completeness, and omission reason.
An unavailable body, body limit, session limit, pending request at Stop, or CDP retrieval failure increments incomplete network evidence and prevents transport readiness.

## Transport and evidence

The dependency free Node bridge binds only to IPv4 `127.0.0.1` and accepts one ingestion path.
It pins the first authenticated Chrome extension Origin and rejects other origins, hosts, methods, paths, compressed input, oversized input, malformed UTF 8, invalid schemas, invalid HMACs, and noncontiguous sequences.
The bridge pins the first valid extension origin during `/v1/connect` and returns an internal ephemeral session secret only to that origin.
The secret is held in process and worker session memory, is never printed or entered by the owner, and is never sent in an evidence envelope or persisted.
Requests and acknowledgements use HMAC SHA 256 and persisted events form a contiguous SHA 256 hash chain.

DOM snapshots are atomically published and referenced by append and flush NDJSON events.
Network events remain inline so query, variables, headers, and bodies retain their exact relationship to the sequence and payload hash.
The service worker retains one unacknowledged envelope and replays it after suspension or an ambiguous response.

Stop first prevents new network requests from entering evidence, marks any already pending exchange incomplete, records a final DOM snapshot, detaches the debugger, and sends a terminal event.
The bridge claims transport readiness only when the terminal event is complete, at least one stable DOM snapshot exists, no DOM snapshot is truncated, every recorded network body is complete, and the final snapshot immediately precedes Stop.

The validator independently checks schemas, event and payload hashes, network body hashes, DOM snapshot hashes, sequence continuity, pinned origin, counters, terminal state, and transport readiness.
Validator success establishes evidence integrity only and does not prove complete application coverage.
