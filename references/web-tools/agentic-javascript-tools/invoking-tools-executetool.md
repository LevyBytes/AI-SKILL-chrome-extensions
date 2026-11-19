### Invoking tools with `executeTool()`

In-page agents and test scripts call `document.modelContext.executeTool(tool, inputObject, options)` to execute a registered tool. The tool runs on the document where it was registered, and the promise resolves to the stringified result returned by the tool's `execute` callback.

Since Chrome 155, `executeTool()` accepts a plain JavaScript object directly for `inputObject`, matching the input format your tool's `execute` callback receives.

```javascript
// 1. Discover the tool (typically done during agent initialization or test setup):
const tools = await document.modelContext.getTools();
const areaTool = tools.find((t) => t.name === "calculate_area");

if (areaTool) {
  const controller = new AbortController();
  // Example input payload matching the tool's inputSchema:
  const inputObject = { width: 10, height: 20 };
  const options = { signal: controller.signal };

  // 2. Pass input arguments as a JavaScript object, with a JSON string fallback for Chrome <155:
  let resultString;
  try {
    resultString = await document.modelContext.executeTool(areaTool, inputObject, options);
  } catch (err) {
    if (err?.message?.startsWith("Failed to parse input")) {
      resultString = await document.modelContext.executeTool(
        areaTool,
        JSON.stringify(inputObject),
        options
      );
    } else {
      // Re-throw real tool execution or cancellation errors:
      throw err;
    }
  }

  console.log("Execution output string:", resultString);
}
```

The returned promise rejects if:
* `inputObject` is not an object or cannot be serialized to a JSON string (e.g. circular references or `BigInt` values). Note that values omitted by JSON serialization (such as functions and `undefined`) will be omitted from the object received by the tool rather than causing a rejection.
* The execution is aborted via `options.signal`.
* The tool was unregistered prior to execution or encounters an unhandled runtime error.

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


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/webmcp/agentic-javascript-tools/guide.md#L309-L403). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
