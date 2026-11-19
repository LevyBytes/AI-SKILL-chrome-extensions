### Handling errors in `execute`

When `execute` throws (or returns a rejected promise), the agent receives only a generic execution failure. The error message is not forwarded to the agent. If your tool encounters an actionable or recoverable error (such as invalid input, missing items, or a failed HTTP status), **DO NOT** `throw new Error(...)`. Instead, return a structured error payload via the tool's normal return value so the AI agent receives the diagnostic details and can self-correct or retry:

```javascript
execute({ itemName }) {
  const item = menuItems.find((entry) => entry.name.toLowerCase() === itemName.toLowerCase());
  if (!item) {
    // Return the error as a value instead of throwing, so the agent receives the message:
    return {
      error: `Menu item "${itemName}" not found.`,
      availableItems: menuItems.map((entry) => entry.name),
    };
  }
  return item;
}
```

Only re-throw when the execution was cancelled (`signal.aborted` is `true`).

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


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/webmcp/agentic-javascript-tools/guide.md#L156-L226). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
