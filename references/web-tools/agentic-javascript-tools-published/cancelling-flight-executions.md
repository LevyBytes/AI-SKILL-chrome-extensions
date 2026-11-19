### Cancelling in-flight executions

Cancellation is initiated by the user or the agent. **MANDATORY:** Any tool that performs network requests or other long-running async work MUST honor `signal`, otherwise cancelled executions keep consuming resources and can write stale data into the UI after the agent has moved on.

* **APIs that accept a signal** (`fetch()`, `addEventListener()`, `ReadableStream` readers): pass `signal` straight through.
* **APIs that do not** (`setTimeout`, `setInterval`, polling loops, `await`-heavy pipelines): call `signal.throwIfAborted()` between steps, and/or reject on `signal.addEventListener('abort', ...)`. Timers accept no signal, so you must clear them yourself in the abort listener.

```javascript
await document.modelContext.registerTool({
  name: "fetch_tool",
  description: "Fetch the text content of a URL and show it on the page.",
  inputSchema: {
    type: "object",
    properties: {
      url: { type: "string", description: "The URL to fetch" },
      priority: {
        type: "string",
        enum: ["high", "low", "auto"],
        description: "Relative network priority for the request",
      },
    },
    required: ["url"],
  },
  execute: async ({ url, priority }, { signal }) => {
    const output = document.querySelector("pre");
    output.textContent = "Loading…";
    try {
      // Passing `signal` aborts the network request the moment execution is cancelled.
      const response = await fetch(url, { priority, signal });
      if (!response.ok) {
        output.textContent = "";
        return { error: `Request failed with status ${response.status}` };
      }
      const text = await response.text();
      output.textContent = text;
      return text;
    } catch (err) {
      // Roll back the UI state this execution set, so a cancelled run leaves no trace.
      output.textContent = "";
      if (signal.aborted) {
        // The execution was cancelled: re-throw instead of returning an error value.
        throw err;
      }
      // Return other errors as a value instead of throwing, so the agent receives the message.
      return { error: err instanceof Error ? err.message : String(err) };
    }
  },
  annotations: { readOnlyHint: true }
});
```

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


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/webmcp/agentic-javascript-tools.md#L169-L249). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
