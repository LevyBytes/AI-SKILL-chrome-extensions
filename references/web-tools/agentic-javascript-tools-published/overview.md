# Agentic JavaScript Tools

The Imperative API uses `document.modelContext.registerTool()` to programmatically define JavaScript tools. This is ideal for Single Page Applications (SPAs) where tools need to be added or removed based on the current route or user state.

WebMCP operates on a producer/consumer architecture:
* **Web pages are tool producers:** You define and register tools using `document.modelContext.registerTool()`. That is all a web page needs to implement. **You do not need to call `getTools()` or `executeTool()` on the page to expose tools to agents.**
* **Browser and extension agents are the primary consumers:** Agents provided by or through the browser — including the browser's built-in agent, browser extensions, DevTools, and system-level assistants — discover and invoke registered tools out-of-band through internal platform mechanisms.
* **In-page agents and test harnesses:** `getTools()` and `executeTool()` exist specifically for in-page JavaScript assistants (e.g. an embedded chat widget or `<iframe>`) and automated test suites that need to discover and invoke tools directly within the page context.

## Registration and Lifecycle

Tools are registered by passing a tool definition object and an optional options object (`ModelContextRegisterToolOptions`), which supports two optional members:
* `signal`: An `AbortSignal` used to unregister the tool when it is no longer needed.
* `exposedTo`: An array of origin strings controlling which documents in the document tree are allowed to discover and execute the tool across frame boundaries.

### Lifecycle Handling with `AbortController`

WebMCP does not provide an `unregisterTool()` method. To unregister a tool, you must pass an `AbortSignal` during registration and abort that signal when the tool is no longer needed.

```javascript
const controller = new AbortController();

await document.modelContext.registerTool({
  name: "get_user_preferences",
  description: "Retrieves the user's saved preferences.",
  inputSchema: { type: "object", properties: {} },
  execute() {
    const prefs = localStorage.getItem("user_prefs");
    return prefs ? JSON.parse(prefs) : { theme: "light" };
  },
  annotations: { readOnlyHint: true }
}, { signal: controller.signal });

// To unregister the tool (e.g., on component unmount):
controller.abort();
```

Aborting the registration signal only unregisters the tool — it does not cancel executions that are already running. Tools that start long-running work must also honor the per-execution signal described below, or unregistering will leave orphaned requests and stale UI updates behind.

### Controlling cross-origin tool exposure with `exposedTo`

By default, a registered tool is private to the registering document and same-origin frames. When your application is embedded in an `<iframe>` (or embeds third-party widgets) and you need ancestor or sibling frames to discover and invoke the tool, specify the allowed origins using `exposedTo`.

```javascript
const controller = new AbortController();

await document.modelContext.registerTool({
  name: "get_cart_items",
  description: "Retrieves items currently in the user's shopping cart.",
  inputSchema: { type: "object", properties: {} },
  async execute(input, { signal }) {
    return await cartService.getItems({ signal });
  },
  annotations: { readOnlyHint: true },
}, {
  signal: controller.signal,
  exposedTo: ["https://checkout.example.com"],
});
```

* **Mutual opt-in handshake**: Cross-origin tool discovery is a two-way opt-in. The tool provider frame authorizes the consumer origin via `exposedTo`, and the consumer frame must explicitly request that provider origin via `getTools({ fromOrigins: [...] })`. Without `fromOrigins`, `getTools()` queries only same-origin documents.
* **Origin matching**: The registering document's own origin always has access. Origins specified in `exposedTo` are granted permission to discover the tool via `document.modelContext.getTools({ fromOrigins: [...] })` and execute it via `document.modelContext.executeTool()`.
* **Security requirement**: Every origin in `exposedTo` MUST be potentially trustworthy (HTTPS or localhost). Passing an invalid or non-secure origin causes `registerTool()` to reject with a `SecurityError`.
* **Scope**: `exposedTo` controls in-page cross-document discovery across frames in the document tree.

## Defining Parameters

Parameters (params) are defined using the `inputSchema` property. This must be a **JSON Schema** object that describes the structured data the tool expects.

```javascript
await document.modelContext.registerTool({
  name: "calculate_area",
  description: "Calculates the area of a rectangle.",
  inputSchema: {
    type: "object",
    properties: {
      width: { type: "number", description: "The width of the rectangle." },
      height: { type: "number", description: "The height of the rectangle." }
    },
    required: ["width", "height"]
  },
  execute(input) {
    // input is { width: 10, height: 20 }
    return input.width * input.height;
  },
  annotations: { readOnlyHint: true }
});
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/webmcp/agentic-javascript-tools.md#L1-L89). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
