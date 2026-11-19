## Tool Factory Pattern

To pass context (like stores or application instances) to your tools, use factory functions.

```javascript
export function createInventoryTool(inventoryManager) {
  return {
    name: "get_inventory",
    description: "Lists items in the inventory.",
    inputSchema: { type: "object", properties: {} },
    execute() {
      return inventoryManager.getItems();
    },
    annotations: { readOnlyHint: true }
  };
}
```

## TypeScript Types

In TypeScript projects, **DO NOT** hand-write declarations for `document.modelContext`. Install the official `webmcp-types` package (`npm install --save-dev webmcp-types`) and add it to `tsconfig.json`, since it is not picked up automatically:

```jsonc
{
  "compilerOptions": {
    "types": ["webmcp-types"]
  }
}
```

* `document.modelContext` is typed as optional, so guard it with `if (document.modelContext)` before use.
* With an inline `inputSchema`, the `execute` input type is inferred from the schema.
* Named types such as `WebMCP.ModelContextTool` are global (no import needed), useful for typing tool factories.

## Framework support

**MANDATORY:** If the app uses React, Angular, or Vue, register tools through that framework's official WebMCP integration, listed below. **DO NOT** call `document.modelContext.registerTool()` from components or write your own lifecycle wrapper. Each integration already handles feature detection, `AbortSignal` cleanup, and scoping tools to the component or injector lifecycle. These APIs are experimental, so before writing code, look up the current signature in the package's types or docs.

| Framework | Package | API | Docs |
|---|---|---|---|
| React 18+ | `use-webmcp-tool` | `useWebMCP(options)`: one call per tool | npmjs.com/package/use-webmcp-tool |
| Angular | `@angular/core`, `@angular/forms/signals` | `provideExperimentalWebMcpTools([...])` (app or route providers), `declareExperimentalWebMcpTool(...)` (inside services), `provideExperimentalWebMcpForms()` + the `experimentalWebMcpTool` option on Signal Forms | angular.dev/ai/webmcp |
| Vue | `@vueuse/core` | `useWebMCP(options)` composable | vueuse.org/core/usewebmcp |

All the rules in this guide still apply when you use these integrations:
* Keep the tool definition shape the same: `name`, `description`, `inputSchema`, `execute(input, { signal })`, and `annotations`.
* Follow the rules for descriptions and annotations.
* Validate input and apply defaults inside `execute`.
* Pass `signal` to long-running work.
* To offer a tool only some of the time, pass `enabled` (React, Vue). **DO NOT** wrap the hook or composable call in a condition.
* Integrations may wrap results and errors (for example as `{ content, isError }`). Check the integration's docs before relying on how errors reach the agent.

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

document.modelContext is not natively supported by any major browser yet.

The WebMCP Imperative API should be used with feature detection to ensure compatibility with browsers that do not yet support WebMCP.

```javascript
if ('modelContext' in document) {
  // Register tools
}
```

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/webmcp/agentic-javascript-tools.md#L345-L423). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
