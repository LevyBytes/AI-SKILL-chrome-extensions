## Flagging Debugging Tools

Since Chrome 156, `annotations` supports `debugging`. Set `annotations.debugging` to `true` for tools built for debugging and developer tooling rather than end-user tasks. Examples: dumping internal app state, toggling feature flags, or seeding test data. This lets agents tell developer-only tools apart from tools meant to act for the user. It defaults to `false`. In-page agents and test harnesses can read it from `RegisteredTool.annotations.debugging` via `getTools()`.

```javascript
await document.modelContext.registerTool({
  name: "dump_app_state",
  description: "Returns a snapshot of the internal application store for debugging.",
  execute() {
    return appStore.getState();
  },
  annotations: {
    readOnlyHint: true, // Only reads state.
    debugging: true,    // Developer tooling, not an end-user action.
  }
});
```

## In-Page Agents and Testing (`getTools` and `executeTool`)

**Web pages do not need `getTools()` or `executeTool()` to expose tools to AI agents.** Simply calling `document.modelContext.registerTool()` is all that is required for browser agents, browser extensions, DevTools, and system-level assistants to discover and execute your tools out-of-band.

The `getTools()` and `executeTool()` methods exist specifically for consumers running inside the JavaScript environment:
1. **In-page JavaScript agents:** An AI assistant, copilot widget, or chat interface embedded directly in the page (or running inside an `<iframe>`) that needs to discover what tools the surrounding page or accessible frames in the document tree offer, and invoke them on behalf of the user.
2. **Automated testing and debugging:** Test suites (such as Playwright, Vitest, or in-browser unit tests) that inspect registered tool metadata and simulate agent tool invocations without requiring a live external LLM harness.

### Discovering available tools with `getTools()`

In-page agents call `document.modelContext.getTools()` to retrieve an array of `RegisteredTool` objects from the current document and any accessible frames in the document tree.

Since Chrome 155, `RegisteredTool.inputSchema` is returned directly as a JavaScript object (a deep copy of the schema supplied at registration). Mutating this object does not alter the registered tool's actual schema.

```javascript
// Example: An in-page AI assistant discovering tools available on the page:
const tools = await document.modelContext.getTools();

// In-page agents can listen for tools being registered or unregistered dynamically:
document.modelContext.addEventListener("toolchange", async () => {
  const updatedTools = await document.modelContext.getTools();
  console.log(`Active tools updated: ${updatedTools.map((t) => t.name).join(", ")}`);
});
```

To discover tools registered inside cross-origin descendant iframes (which must explicitly grant access via `exposedTo` during registration), pass `fromOrigins` in the options dictionary:

```javascript
// Query tools registered in the embedded cart frame that exposed them to this checkout origin:
const cartTools = await document.modelContext.getTools({
  fromOrigins: ["https://cart.example.com"],
});
```

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


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/webmcp/agentic-javascript-tools.md#L250-L344). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
