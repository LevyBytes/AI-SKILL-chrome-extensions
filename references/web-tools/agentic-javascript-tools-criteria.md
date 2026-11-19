- The code checks for `modelContext` in `document` before registering a tool.
- `document.modelContext.registerTool` is called with a tool definition object.
- The tool definition includes a `name`, `description`, `inputSchema`, and `execute`.
- Tool names contain 1 to 128 ASCII letters, digits, underscores (`_`), hyphens (`-`), or periods (`.`).
- The `inputSchema` is a valid JSON Schema object with property descriptions.
- An `AbortController` is created and its signal is passed to `registerTool`.
- The `execute` function is asynchronous if it performs any async operations.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/webmcp/agentic-javascript-tools/expectations.md#L1-L7). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
