## Flagging Consequential Tools

Since Chrome 154, `annotations` supports `consequentialHint`. Set it to `true` for tools that take high-stakes, irreversible, or real-world actions — booking travel, moving money, sending messages, or deleting data. It signals agents to request explicit user confirmation before execution.

```javascript
await document.modelContext.registerTool({
  name: 'book_flight',
  description: 'Book a flight for the user with confirmed flight details.',
  inputSchema: {
    type: 'object',
    properties: {
      flightId: { type: 'string', description: 'ID of the flight to book' },
      passengers: { type: 'number', description: 'Number of tickets to purchase' },
    },
    required: ['flightId', 'passengers'],
  },
  execute: async ({ flightId, passengers }, { signal }) => {
    // Forward `signal` to the transaction API to honor cancellation:
    return await bookFlightReservation({ flightId, passengers }, { signal });
  },
  annotations: {
    readOnlyHint: false,      // This tool mutates state (it makes a booking).
    consequentialHint: true,  // Spends money and is not trivially reversible.
    untrustedContentHint: false, // Output is first-party data, not third-party content.
  }
});
```

**MANDATORY:** Treat `consequentialHint` as a hint, not an enforcement mechanism. It does not block execution on its own, and browsers that predate the hint will not prompt at all. Keep whatever in-app confirmation the action already warrants.

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


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/webmcp/agentic-javascript-tools/guide.md#L227-L308). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
