## API Notes

*   **annotations**: (Optional) A dictionary for tool metadata.
    *   **readOnlyHint**: (Optional) Set to `true` if the tool does not modify any state and only reads data. This helps agents decide when it is safe to call the tool.
    *   **consequentialHint**: (Optional, Chrome 154+) Set to `true` for high-stakes, irreversible, or real-world actions so agents request user confirmation first.
    *   **untrustedContentHint**: (Optional) Set to `true` when the tool returns content your site does not control, such as user-generated text or third-party API responses.
    *   **debugging**: (Optional, Chrome 156+) Set to `true` when the tool is meant for debugging and developer tooling, not end-user tasks. Defaults to `false`.
*   **Registration Options**:
    *   **signal**: (Optional) An `AbortSignal` used to unregister the tool when it is no longer needed.
    *   **exposedTo**: (Optional) An array of secure origin strings controlling which documents in the document tree are allowed to discover and execute the tool across frame boundaries.
*   **Tool Discovery Options (`ModelContextGetToolOptions`)**:
    *   **fromOrigins**: (Optional) An array of secure origin strings to query in accessible frames. Calling `getTools()` without `fromOrigins` queries only same-origin documents.
*   **Return Format**: The `execute` function can return any JSON-serializable value (object, array, string, number, boolean). The message of an exception thrown from `execute` is not forwarded to the agent, so return actionable errors as structured error payloads (e.g. `{ error: "..." }`) via the tool's return value so the agent can read and act on them.
*   **Secure Context**: WebMCP requires HTTPS. All origins in `exposedTo` and `fromOrigins` must also be potentially trustworthy.
*   **Deprecated/Removed**: `navigator.modelContext` (deprecated in Chromium 150), `unregisterTool()`, `provideContext()`, and `clearContext()` are no longer supported.

## Fallback strategies

{{ BASELINE_STATUS("document-modelcontext") }}

The WebMCP Imperative API should be used with feature detection to ensure compatibility with browsers that do not yet support WebMCP.

```javascript
if ('modelContext' in document) {
  // Register tools
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/webmcp/agentic-javascript-tools/guide.md#L404-L430). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
