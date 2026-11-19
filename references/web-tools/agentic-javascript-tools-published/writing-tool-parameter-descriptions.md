## Writing Tool and Parameter Descriptions

The agent already receives the full `inputSchema`, so the `description` only needs to say what the tool does and when to use it. **DO NOT** repeat parameter names, types, `enum` values, defaults, or limits in it; declare them in the schema (`enum`, `default`, `minimum`/`maximum`) instead. Parameter descriptions follow the same rule: say what the value means, not its type or allowed values.

The browser does not validate arguments against `inputSchema` or apply `default` values, so do both in `execute`.

```javascript
const SORT_ORDERS = ["newest", "price_low_to_high"];

await document.modelContext.registerTool({
  name: "search_products",
  // Don't list the sort orders here, even via SORT_ORDERS: `enum` already does.
  description: "Searches the product catalog by keyword. Use when the user wants to find or compare products.",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Words to search for." },
      sort: { type: "string", enum: SORT_ORDERS, default: "newest", description: "Order of the results." },
    },
    required: ["query"],
  },
  async execute({ query, sort = "newest" }, { signal }) {
    if (typeof query !== "string" || !SORT_ORDERS.includes(sort)) {
      return { error: "Pass a search query and a supported sort order.", sortOrders: SORT_ORDERS };
    }
    return await productService.search({ query, sort }, { signal });
  },
  annotations: { readOnlyHint: true },
});
```

## Execution Patterns

The `execute` callback always receives two arguments: the input object, and an options object carrying an `AbortSignal` — `execute(inputObject, { signal })`.

### When to use `async execute`
Use `async` when the tool involves operations that return a Promise or take time to complete:
- **Network calls**: Fetching data from an API.
- **Asynchronous Storage**: Accessing IndexedDB.
- **External Events**: Waiting for a specific state change or animation to finish.

```javascript
async execute(input, { signal }) {
  const response = await fetch(`/api/data/${input.id}`, { signal });
  return await response.json();
}
```

### When to use `execute` (Synchronous)
Use a standard synchronous function for immediate operations. A synchronous tool runs to completion before cancellation can be observed, so it can ignore the signal:
- **Pure logic**: Math, filtering, or sorting data already in memory.
- **Synchronous state**: Reading from `localStorage` or a synchronous state manager.

```javascript
execute(input) {
  return input.items.filter(item => item.active);
}
```

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


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/webmcp/agentic-javascript-tools.md#L90-L168). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
